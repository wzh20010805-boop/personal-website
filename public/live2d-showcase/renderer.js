import {EXPRESSIONS, blendFacePose, IRIS_DEFAULTS} from './expressions.js';

const MODEL_URL = new URL('./model/seethrough_parts_v2.model3.json', import.meta.url);
const FPS = 60, STEP = 1 / FPS;
const DISCRETE = new Set(['ParamHandR', 'ParamArmFrontL', 'ParamArmFrontR', 'ParamEyeLStyle', 'ParamEyeRStyle', 'ParamIrisStyle', 'ParamMouthStyle', 'ParamOutfit', 'ParamIrisColorL', 'ParamIrisColorR']);
const smooth = value => {const x = Math.max(0, Math.min(1, value)); return x * x * (3 - 2 * x);};
const lerp = (a, b, t) => a + (b - a) * t;
const cubic = (a, b, c, d, u) => (1-u)**3*a + 3*(1-u)**2*u*b + 3*(1-u)*u*u*c + u**3*d;

// Read the exported Cubism segments, including discrete/inverse-step segments.
export function sampleMotionCurve(curve, seconds) {
  const a = curve.Segments;
  if (!a?.length) throw new Error(`Empty motion curve: ${curve.Id}`);
  let t0 = a[0], v0 = a[1], i = 2;
  if (seconds <= t0) return v0;
  while (i < a.length) {
    const kind = a[i++];
    if (kind === 1) {
      const [t1, v1, t2, v2, t3, v3] = a.slice(i, i + 6); i += 6;
      if (seconds <= t3) {
        let lo = 0, hi = 1;
        for (let n = 0; n < 28; n++) {const u = (lo + hi) / 2; if (cubic(t0,t1,t2,t3,u) < seconds) lo = u; else hi = u;}
        return cubic(v0,v1,v2,v3,(lo+hi)/2);
      }
      t0 = t3; v0 = v3;
    } else {
      if (![0, 2, 3].includes(kind)) throw new Error(`Unsupported Cubism segment: ${kind}`);
      const t1 = a[i++], v1 = a[i++];
      if (seconds < t1) return kind === 2 ? v0 : kind === 3 ? v1 : lerp(v0, v1, (seconds - t0) / (t1 - t0));
      if (seconds === t1) return v1;
      t0 = t1; v0 = v1;
    }
  }
  return v0;
}

async function jsonAt(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

function drawableBounds(internal, matches = () => true) {
  const core = internal.coreModel;
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (let i = 0; i < core.getDrawableCount(); i++) {
    if (core.getDrawableOpacity(i) < .02 || !matches(String(core.getDrawableId(i)))) continue;
    const b = internal.getDrawableBounds(i);
    left = Math.min(left, b.x); top = Math.min(top, b.y);
    right = Math.max(right, b.x + b.width); bottom = Math.max(bottom, b.y + b.height);
  }
  return Number.isFinite(left) && right > left && bottom > top ? {x:left, y:top, width:right-left, height:bottom-top} : null;
}

export async function createShowcaseActor(canvas, sampleAt) {
  if (!globalThis.PIXI?.live2d) throw new Error('PIXI / Cubism scripts must load before the showcase renderer.');
  const settings = await jsonAt(MODEL_URL);
  const references = settings.FileReferences;
  const files = [...new Set(Object.values(references.Motions ?? {}).flat().map(item => item.File))];
  const motions = new Map(await Promise.all(files.map(async file => [file, await jsonAt(new URL(file, MODEL_URL))])));
  const physicsDefinition = references.Physics ? await jsonAt(new URL(references.Physics, MODEL_URL)) : null;
  const physicsIds = new Set((physicsDefinition?.PhysicsSettings ?? []).flatMap(group => group.Output.map(output => output.Destination.Id)));
  const byId = new Map();
  for (const [group, entries] of Object.entries(references.Motions ?? {})) {
    for (const entry of entries) {
      const motion = motions.get(entry.File);
      const id = entry.File.split('/').at(-1).replace(/\.motion3\.json$/, '');
      byId.set(id, motion);
      if (!byId.has(group)) byId.set(group, motion);
    }
  }
  const idle = byId.get('seethrough_parts_v2.36');
  if (!idle) throw new Error('The model index must include the authored 36-second natural idle.');

  const app = new PIXI.Application({view:canvas, width:1920, height:1080, resolution:1, backgroundAlpha:0, antialias:true, autoStart:false, preserveDrawingBuffer:true});
  let model, mocUrl;
  try {
    // Reuse the site's byte-identical model archive and textures. The split
    // lossless archive keeps every asset below the static host's file limit.
    const archive = settings.MocArchive;
    if (archive?.encoding !== 'gzip' || !archive.parts?.length) throw new Error('Unsupported model archive');
    const parts = await Promise.all(archive.parts.map(async file => {
      const response = await fetch(new URL(file, MODEL_URL));
      if (!response.ok) throw new Error(`Model part: HTTP ${response.status}`);
      return response.arrayBuffer();
    }));
    const bytes = await new Response(new Blob(parts).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    if (bytes.byteLength !== archive.byteLength) throw new Error('Incomplete model archive');
    mocUrl = URL.createObjectURL(new Blob([bytes], {type:'application/octet-stream'}));
    settings.url = MODEL_URL.href;
    settings.FileReferences.Moc = mocUrl;
    const runtimeSettings = new PIXI.live2d.Cubism4ModelSettings(settings);
    // The adapter's legacy URL resolver does not preserve blob URLs.
    runtimeSettings.resolveURL = file => new URL(file, MODEL_URL).href;
    await new Promise((resolve, reject) => {
      model = PIXI.live2d.Live2DModel.fromSync(runtimeSettings, {
        autoUpdate:false, autoInteract:false, motionPreload:'NONE',
        onLoad:resolve, onError:reject,
      });
    });
    app.stage.addChild(model);
    const internal = model.internalModel, core = internal.coreModel;
    const native = core._model.parameters;
    const parameterDefinitions = Array.from({length:core.getParameterCount()}, (_, index) => ({id:String(native.ids[index]), default:core.getParameterDefaultValue(index), min:native.minimumValues[index], max:native.maximumValues[index]}));
    const defaults = Object.fromEntries(parameterDefinitions.map(p => [p.id, p.default]));
    const definitions = new Map(parameterDefinitions.map(p => [p.id, p]));
    internal.motionManager.stopAllMotions();
    internal.motionManager.update = () => false;
    if (internal.motionManager.expressionManager) internal.motionManager.expressionManager.update = () => false;
    internal.eyeBlink = undefined;
    internal.pose = undefined;
    internal.updateFocus = () => {};
    internal.updateNaturalMovements = () => {};
    model.elapsedTime = 0;
    model.deltaTime = 0;

    let pose = {...defaults}, actual = {...defaults}, frame = -1, requestedTime = 0, disposed = false;
    let mode = 'timeline', liveFrame = 0, liveRemainder = 0;
    let previousPose = null, transitionSource = null, transitionFrame = 0, previousMotionKey = null, faceBaseline = null;
    let previousView = null, previousActorX = null, camera = null, cameraSource = null, cameraFrame = 0, renderedSample = null;
    const apply = values => {for (const [id,value] of Object.entries(values)) core.setParameterValueById(id,value);};
    internal.on('afterMotionUpdate', () => apply(pose));
    internal.on('beforeModelUpdate', () => {
      // Only explicit non-physics controls may override the simulated result.
      for (const [id,value] of Object.entries(pose)) if (!physicsIds.has(id)) core.setParameterValueById(id,value);
      actual = Object.fromEntries(parameterDefinitions.map(p => [p.id, core.getParameterValueById(p.id)]));
    });

    apply(defaults); core.update();
    const full = drawableBounds(internal);
    const features = drawableBounds(internal, id => /eye|mouth|brow|lip|oral|眼|嘴|眉/i.test(id));
    if (!full) throw new Error('The model has no visible drawable bounds.');
    const head = features ? {x:features.x+features.width/2, y:features.y+features.height/2, width:features.width*3.1, height:features.height*3.3} : {x:full.x+full.width/2, y:full.y+full.height*.22, width:full.width*.8, height:full.height*.48};
    model.anchor.set(0,0);

    const sampleClip = (clip,time,values) => {
      const duration = clip.Meta.Duration;
      const local = clip.Meta.Loop ? ((time % duration) + duration) % duration : Math.max(0,Math.min(duration,time));
      for (const curve of clip.Curves) if (curve.Target === 'Parameter' && definitions.has(curve.Id)) values[curve.Id] = sampleMotionCurve(curve,local);
    };

    function step(index, warmup = false, liveSample = null) {
      const seconds = index / FPS;
      const state = liveSample ?? sampleAt(seconds);
      if (!state || !EXPRESSIONS.some(item => item.id === (state.expression ?? 'neutral'))) throw new Error(`Invalid showcase expression at ${seconds}`);
      const values = {...defaults};
      sampleClip(idle, state.still ? 0 : (state.idleTime ?? state.time ?? seconds), values);
      if (state.motion) {
        const clip = byId.get(state.motion);
        if (!clip) throw new Error(`Unknown showcase motion: ${state.motion}`);
        sampleClip(clip, state.motionTime ?? 0, values);
      }
      // Accelerated clips do not have seconds-motionTime as a stable onset.
      // The chapter/explicit motion start remains fixed while local time scales.
      const onset = state.motion ? Math.round((state.motionStart ?? state.start ?? (seconds - (state.motionTime ?? 0))) * FPS) : 0;
      const key = state.motionKey ?? `${state.motion ?? 'idle'}:${onset}`;
      if (previousPose && key !== previousMotionKey) {transitionSource = previousPose; transitionFrame = index;}
      if (transitionSource) {
        const amount = smooth((index-transitionFrame) / (FPS*.22));
        for (const id of Object.keys(values)) if (!DISCRETE.has(id) && !/^ParamEye[LR]Open$/.test(id)) values[id] = lerp(transitionSource[id] ?? values[id], values[id], amount);
        if (amount >= 1) transitionSource = null;
      }
      previousMotionKey = key;
      previousPose = {...values};

      const expression = EXPRESSIONS.find(item => item.id === (state.expression ?? 'neutral'));
      faceBaseline = faceBaseline ? blendFacePose(faceBaseline, expression.values, STEP) : {...expression.values};
      const face = {...faceBaseline};
      for (const side of ['L','R']) if (face[`ParamEye${side}Style`] === 0) face[`ParamEye${side}Open`] *= values[`ParamEye${side}Open`];
      if (expression.id === 'neutral' || expression.id === 'smile') {
        face.ParamEyeBallX = values.ParamEyeBallX;
        face.ParamEyeBallY = values.ParamEyeBallY;
      }
      // Expressions own the face but never head/body angles or physics outputs.
      Object.assign(values, face, {ParamOutfit:state.outfit ?? 0, ParamIrisColorL:state.irisColorL ?? IRIS_DEFAULTS.ParamIrisColorL, ParamIrisColorR:state.irisColorR ?? IRIS_DEFAULTS.ParamIrisColorR});
      if (state.speechMouth !== null && state.speechMouth !== undefined) values.ParamMouthOpenY = state.speechMouth;
      for (const [id,value] of Object.entries(values)) {
        if (!Number.isFinite(value)) throw new Error(`Invalid parameter ${id} at ${seconds}`);
        const def = definitions.get(id);
        values[id] = Math.max(def.min,Math.min(def.max,DISCRETE.has(id) ? Math.round(value) : value));
      }
      pose = values;
      // model.update() only queues dt until PIXI draws. Use the internal update
      // directly so every 1/60 physics step actually runs, even during seeks.
      internal.update(STEP*1000, (warmup ? 0 : seconds)*1000);
      model.deltaTime = 0;
      model.elapsedTime = seconds*1000;

      const view = state.view ?? 'full';
      const scale = view === 'face' ? 1450/full.height : 880/full.height;
      const center = view === 'face' ? head : {x:full.x+full.width/2,y:full.y+full.height/2};
      const actorX = state.actorX ?? 1220;
      const target = {scale, x:actorX-center.x*scale, y:(view === 'face' ? 620 : 550)-center.y*scale};
      if (camera && (view !== previousView || actorX !== previousActorX)) {cameraSource = {...camera}; cameraFrame = index;}
      if (cameraSource) {
        const amount = smooth((index-cameraFrame)/(FPS*.5));
        camera = Object.fromEntries(Object.entries(target).map(([id,value]) => [id,lerp(cameraSource[id],value,amount)]));
        if (amount >= 1) cameraSource = null;
      } else camera = target;
      previousView = view;
      previousActorX = actorX;
      model.scale.set(camera.scale);
      model.position.set(camera.x,camera.y);
      renderedSample = {...state};
    }

    function reset() {
      frame = -1;
      previousPose = transitionSource = faceBaseline = null;
      previousMotionKey = null;
      previousView = previousActorX = camera = cameraSource = null;
      apply(defaults);
      core.saveParameters();
      internal.physics?.initialize?.();
      // Identical warm-up on initial load and every backward seek.
      for (let i=0;i<90;i++) step(0,true);
      step(0); frame=0;
    }

    function inspect() {
      return {time:frame/FPS, requestedTime, frame, mode, liveTime:liveFrame/FPS, parameterCount:parameterDefinitions.length, parameterDefinitions:parameterDefinitions.map(p=>({...p})), parameters:{...actual}, physics:Object.fromEntries([...physicsIds].map(id=>[id,actual[id]])), sample:renderedSample && {...renderedSample}, camera:camera && {...camera}, motions:[...byId.keys()]};
    }

    function renderAt(seconds) {
      if (disposed) throw new Error('Showcase actor has been destroyed.');
      if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('Render time must be a non-negative finite number.');
      requestedTime = seconds;
      const target = Math.round(seconds*FPS);
      // Any live interaction invalidates the deterministic frame history, even
      // when this request happens to name the currently displayed frame.
      const wasLive = mode === 'live';
      mode = 'timeline'; liveFrame = 0; liveRemainder = 0;
      if (wasLive || frame < 0 || target < frame) reset();
      while (frame < target) {frame++; step(frame);}
      // A repeated frame only redraws: it never advances smoothing or physics.
      app.renderer.render(app.stage);
      return inspect();
    }

    function advanceLive(deltaSeconds, sampleLive) {
      if (disposed) throw new Error('Showcase actor has been destroyed.');
      if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) throw new RangeError('Live delta must be a non-negative finite number.');
      if (typeof sampleLive !== 'function') throw new TypeError('Live rendering requires a state sampler.');
      // Preserve the last pose, transition sources, camera and physics when
      // handing over control. A zero delta redraws without advancing anything.
      mode = 'live';
      liveRemainder += deltaSeconds;
      const steps = Math.floor((liveRemainder + 1e-9) / STEP);
      liveRemainder = Math.max(0, liveRemainder - steps * STEP);
      for (let i = 0; i < steps; i++) {
        const nextLiveFrame = liveFrame + 1;
        const state = sampleLive(nextLiveFrame / FPS);
        if (!state) throw new Error('Live state sampler returned no state.');
        liveFrame = nextLiveFrame;
        step(++frame, false, state);
      }
      app.renderer.render(app.stage);
      return inspect();
    }

    renderAt(0);
    return {renderAt,advanceLive,inspect,destroy() {if (disposed) return;disposed=true;app.destroy(false,{children:true,texture:true,baseTexture:true});}};
  } catch (error) {
    if (model && !model.parent) model.destroy();
    app.destroy(false,{children:true,texture:true,baseTexture:true});
    throw error;
  } finally {
    if (mocUrl) URL.revokeObjectURL(mocUrl);
  }
}
