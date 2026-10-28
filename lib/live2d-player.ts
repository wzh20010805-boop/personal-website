import { getPetMotion, petMotions, type PetMotionId } from "@/data/live2d-motions";
import { publicAsset } from "@/lib/public-assets";
import { getPetExpression, getPetOutfit, type PetAppearance } from "@/data/live2d-appearance";

// This boundary describes only the APIs consumed from the pinned browser runtimes.
type Motion = { setIsLoop(loop: boolean): void };
type Model = {
  x: number;
  y: number;
  anchor: { set(x: number, y: number): void };
  scale: { set(scale: number): void };
  internalModel: {
    width: number;
    height: number;
    breath: { setParameters(parameters: never[]): void };
    eyeBlink?: unknown;
    lipSync: boolean;
    focusController: { x: number; y: number; focus(x: number, y: number, instant: boolean): void };
    coreModel: {
      addParameterValueById(id: string, value: number): void;
      setParameterValueById(id: string, value: number): void;
    };
    on(event: "beforeModelUpdate", callback: () => void): void;
    updateFocus(): void;
    motionManager: {
      state: { isActive(group: string, index: number): boolean };
      loadMotion(group: string, index: number): Promise<Motion | undefined>;
      on(event: "motionStart", callback: (group: string, index: number) => void): void;
      on(event: "motionFinish", callback: () => void): void;
    };
  };
  motion(group: string, index: number, priority: number): Promise<boolean>;
  update(milliseconds: number): void;
  emit(event: "destroy"): void;
  destroy(options?: { children: boolean; texture: boolean; baseTexture: boolean }): void;
};
type Application = {
  renderer: { resize(width: number, height: number): void };
  stage: { addChild(model: Model): void };
  ticker: { deltaMS: number; maxFPS: number; add(callback: () => void): void };
  render(): void;
  start(): void;
  stop(): void;
  destroy(removeView: boolean, options: { children: boolean; texture: boolean; baseTexture: boolean }): void;
};
type PixiRuntime = {
  Application: new (options: Record<string, unknown>) => Application;
  Texture: { removeFromCache(url: string): { destroy(baseTexture: boolean): void } | null };
  live2d: {
    Cubism4ModelSettings: new (source: Record<string, unknown>) => { resolveURL(file: string): string };
    Live2DModel: { fromSync(source: Record<string, unknown>, options: Record<string, unknown>): Model };
    config: { logLevel: number; sound: boolean };
  };
};

export type PetPlayer = {
  play(id: PetMotionId): Promise<void>;
  setAppearance(appearance: PetAppearance): void;
  destroy(): void;
};
export type PetBounds = { left: number; top: number; width: number; height: number };

const scripts = new Map<string, Promise<void>>();
let initialization = Promise.resolve();
// PSD2Live 3.4.5: CubismSdkPreviewSessionKt.CUBISM_POINTER_TRACKING_BINDINGS.
const pointerBindings = [
  ["ParamAngleX", 30, 0], ["ParamAngleY", 0, 30], ["ParamBodyAngleX", 10, 0],
  ["ParamEyeBallX", 1, 0], ["ParamEyeBallY", 0, 1],
] as const;

function loadScript(file: string) {
  const url = publicAsset(`/live2d/vendor/${file}`);
  const existing = scripts.get(url);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => {
      window.clearTimeout(timeout);
      script.remove();
      scripts.delete(url);
      reject(new Error(`Unable to load ${file}`));
    };
    const timeout = window.setTimeout(fail, 20000);
    script.src = url;
    script.async = true;
    script.onload = () => { window.clearTimeout(timeout); resolve(); };
    script.onerror = fail;
    document.head.append(script);
  });
  scripts.set(url, promise);
  return promise;
}

async function loadRuntime() {
  await loadScript("pixi-6.5.10.min.js");
  await loadScript("live2dcubismcore-5.2.min.js");
  await loadScript("pixi-live2d-display-0.4.0.min.js");
  const pixi = (window as Window & { PIXI?: PixiRuntime }).PIXI;
  if (!pixi?.live2d?.Live2DModel) throw new Error("Live2D runtime is unavailable");
  pixi.live2d.config.logLevel = 3;
  pixi.live2d.config.sound = false;
  return pixi;
}

export async function createPetPlayer(
  canvas: HTMLCanvasElement,
  initialIdle: PetMotionId,
  onMotion: (id: PetMotionId) => void,
  onBounds: (bounds: PetBounds) => void,
  signal: AbortSignal,
): Promise<PetPlayer> {
  const pixi = await loadRuntime();
  signal.throwIfAborted();
  // A dismissed model may still be finishing setup. Don't share its pending
  // texture-cache entries with a newly recalled model until cleanup completes.
  const previousInitialization = initialization;
  let releaseInitialization: () => void = () => undefined;
  initialization = new Promise<void>((resolve) => { releaseInitialization = resolve; });
  await previousInitialization;
  let model: Model | undefined;
  let loading = true;
  let app: Application | undefined;
  let observer: ResizeObserver | undefined;
  let destroyed = false;
  let sequence = 0;
  let idle = initialIdle;
  let appearance: PetAppearance = { expression: "neutral", outfit: "maid" };
  let pointer: { x: number; y: number } | undefined;
  let mocUrl: string | undefined;
  let textureUrls: string[] = [];
  const trackPointer = (event: PointerEvent) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") pointer = { x: event.clientX, y: event.clientY };
  };
  const resetPointer = () => { pointer = undefined; };
  const visibility = () => {
    if (document.hidden) { resetPointer(); app?.stop(); }
    else app?.start();
  };
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    sequence++;
    observer?.disconnect();
    document.removeEventListener("pointermove", trackPointer);
    document.documentElement.removeEventListener("pointerleave", resetPointer);
    window.removeEventListener("blur", resetPointer);
    document.removeEventListener("visibilitychange", visibility);
    signal.removeEventListener("abort", abort);
    if (app) app.destroy(false, { children: true, texture: true, baseTexture: true });
    else if (model?.internalModel) model.destroy({ children: true, texture: true, baseTexture: true });
    else model?.emit("destroy");
  };
  const abort = () => {
    // Cancel loading requests, but release partial resources only once setup settles.
    // The adapter cannot safely destroy a model before its internal model exists.
    if (loading) model?.emit("destroy");
    else destroy();
  };

  try {
    signal.throwIfAborted();
    signal.addEventListener("abort", abort, { once: true });
    // The expanded rig exceeds the static host's per-file limit. Transport its
    // lossless gzip archive in bounded parts, then give Cubism the original bytes.
    const modelUrl = new URL(publicAsset("/live2d/character/character.model3.json"), window.location.href).href;
    const response = await fetch(modelUrl, { signal, cache: "no-cache" });
    if (!response.ok) throw new Error(`Unable to load model settings (${response.status})`);
    const source = await response.json();
    source.url = modelUrl;
    textureUrls = source.FileReferences.Textures.map((file: string) => new URL(file, modelUrl).href);
    if (source.MocArchive) {
      const archive = source.MocArchive as { encoding: string; parts: string[]; byteLength: number };
      if (archive.encoding !== "gzip" || !archive.parts.length) throw new Error("Unsupported model archive");
      const parts = await Promise.all(archive.parts.map(async (file) => {
        const part = await fetch(new URL(file, modelUrl), { signal });
        if (!part.ok) throw new Error(`Unable to load model part (${part.status})`);
        return part.arrayBuffer();
      }));
      const stream = new Blob(parts).stream().pipeThrough(new DecompressionStream("gzip"));
      const bytes = await new Response(stream).arrayBuffer();
      signal.throwIfAborted();
      if (bytes.byteLength !== archive.byteLength) throw new Error("Incomplete model archive");
      mocUrl = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
      source.FileReferences.Moc = mocUrl;
    }
    const settings = new pixi.live2d.Cubism4ModelSettings(source);
    // The adapter's legacy URL resolver corrupts blob:http:// URLs. Use the
    // native resolver for both the decoded model and ordinary relative assets.
    settings.resolveURL = (file) => new URL(file, modelUrl).href;
    await new Promise<void>((resolve, reject) => {
      // Holding the instance from the start also lets us release it on texture failure.
      model = pixi.live2d.Live2DModel.fromSync(settings, {
        autoUpdate: false,
        autoInteract: false,
        motionPreload: "NONE",
        // The player owns the selected idle and resumes it after each one-shot action.
        idleMotionGroup: "ManualIdle",
        onLoad: () => resolve(),
        onError: reject,
      });
    });
    loading = false;
    signal.throwIfAborted();
    if (!model) throw new Error("Live2D model was not created");
    const loadedModel = model;
    const internal = model.internalModel;
    // These authored clips already contain blinking, breathing and head/body motion.
    internal.breath.setParameters([]);
    internal.eyeBlink = undefined;
    internal.lipSync = false;
    // Apply appearance after the runtime saves the authored motion pose. Its
    // loadParameters() then restores that baseline, so expressions never leak
    // into subsequent frames or accumulate on top of cursor tracking.
    internal.on("beforeModelUpdate", () => {
      const core = internal.coreModel;
      core.setParameterValueById("ParamOutfit", getPetOutfit(appearance.outfit).value);
      if (appearance.expression === "neutral") return;
      const { values } = getPetExpression(appearance.expression);
      for (const [id, value] of Object.entries(values)) {
        if (id === "ParamEyeBallX" || id === "ParamEyeBallY") {
          core.addParameterValueById(id, value);
        } else if (id === "ParamEyeLOpen" || id === "ParamEyeROpen") {
          // Original eyes keep the clip's blinking. Alternate closed-eye art
          // must not be squashed again by the openness parameter.
          const style = id === "ParamEyeLOpen" ? values.ParamEyeLStyle : values.ParamEyeRStyle;
          if (style !== 0) core.setParameterValueById(id, 1);
        } else if (id !== "ParamEyeBallForm") {
          core.setParameterValueById(id, value);
        }
      }
    });
    // Preserve the authored clips and physics, adding the same five cursor
    // bindings as PSD2Live. Its direct mode does not add cursor-driven Z tilt.
    internal.updateFocus = () => {
      const { x, y } = internal.focusController;
      for (const [id, xScale, yScale] of pointerBindings) {
        internal.coreModel.addParameterValueById(id, x * xScale + y * yScale);
      }
    };
    await Promise.all(petMotions.map(async (motion) => {
      const loaded = await internal.motionManager.loadMotion(motion.group, motion.index);
      if (!loaded) throw new Error(`Unable to load motion ${motion.id}`);
      loaded.setIsLoop(motion.idle);
    }));
    signal.throwIfAborted();

    const viewport = canvas.parentElement ?? canvas;
    app = new pixi.Application({
      view: canvas,
      width: viewport.clientWidth,
      height: viewport.clientHeight,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      sharedTicker: false,
      preserveDrawingBuffer: true,
    });
    // Continuous motion curves and pointer tracking benefit from 60 Hz updates.
    // Keep a ceiling for high-refresh displays; hidden pages still stop below.
    app.ticker.maxFPS = 60;
    app.stage.addChild(model);
    model.anchor.set(0.5, 1);
    const resize = () => {
      if (!app || destroyed) return;
      const width = viewport.clientWidth;
      const height = viewport.clientHeight;
      app.renderer.resize(width, height);
      // This character occupies the middle 80% of its square model canvas.
      // Fit the artwork, rather than reserving space for transparent side padding.
      // Scale the transparent margin too, so 50% also halves the visible artwork.
      const inset = 8 * Math.min(width / 440, height / 560);
      const scale = Math.min((width - inset * 2) / (internal.width * 0.8), (height - inset * 2) / internal.height);
      loadedModel.scale.set(scale);
      loadedModel.x = width / 2;
      loadedModel.y = height - inset;
      // Resizing clears the WebGL drawing buffer. Paint the current pose before
      // the browser presents it; the next ticker update may run after this frame.
      // Rendering consumes only any pending delta, without advancing motion.
      app.render();
      onBounds({
        left: (width - internal.width * scale * 0.8) / 2 - inset / 2,
        top: height - inset - internal.height * scale,
        width: internal.width * scale * 0.8 + inset,
        height: internal.height * scale + inset / 2,
      });
    };
    resize();
    observer = new ResizeObserver(resize);
    // Pixi writes a pixel width to the canvas; observe its responsive container.
    observer.observe(viewport);
    app.ticker.add(() => {
      if (destroyed || !app) return;
      let x = 0;
      let y = 0;
      if (pointer) {
        // Re-project a stationary cursor too when the pet is moved or resized.
        const box = canvas.getBoundingClientRect();
        if (box.width && box.height) {
          x = (pointer.x - box.left) / box.width * 2 - 1;
          y = 1 - (pointer.y - box.top) / box.height * 2;
        }
      }
      // The supplied PSD2Live workspace has smoothMouseTracking disabled.
      internal.focusController.focus(x, y, true);
      loadedModel.update(app.ticker.deltaMS);
    });
    // Observe the page without placing a pointer-catching layer over its links.
    document.addEventListener("pointermove", trackPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);
    document.addEventListener("visibilitychange", visibility);
    visibility();

    const play = async (id: PetMotionId) => {
      if (destroyed) return;
      const motion = getPetMotion(id);
      if (motion.idle) idle = motion.id;
      // The runtime returns false when this clip is already playing/reserved.
      // Keeping that successful selection is not a playback failure.
      if (internal.motionManager.state.isActive(motion.group, motion.index)) return;
      sequence++;
      const started = await loadedModel.motion(motion.group, motion.index, 3);
      if (!started && !destroyed) throw new Error(`Unable to start motion ${id}`);
    };
    internal.motionManager.on("motionStart", (group, index) => {
      const motion = petMotions.find((item) => item.group === group && item.index === index);
      if (!destroyed && motion) onMotion(motion.id);
    });
    internal.motionManager.on("motionFinish", () => {
      const finishedSequence = sequence;
      // Wait for the library to finish clearing the previous motion's state.
      queueMicrotask(() => {
        if (!destroyed && sequence === finishedSequence) void play(idle).catch(console.error);
      });
    });
    await play("Greeting8");
    return {
      play,
      setAppearance: (next) => {
        appearance = { expression: getPetExpression(next.expression).id, outfit: getPetOutfit(next.outfit).id };
      },
      destroy,
    };
  } catch (error) {
    loading = false;
    destroy();
    // The adapter starts textures before the model is ready. On failure they
    // may exist only in Pixi's cache, not yet in model.textures; clear both.
    if (model) {
      for (const url of textureUrls) {
        pixi.Texture.removeFromCache(url)?.destroy(true);
      }
    }
    throw error;
  } finally {
    if (mocUrl) URL.revokeObjectURL(mocUrl);
    releaseInitialization();
  }
}
