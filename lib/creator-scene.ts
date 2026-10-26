import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { CategoryId } from "@/data/categories";
import { createCreatorCorner } from "./creator-scene-model";

export type CreatorView = "free" | "front" | "left" | "right" | "back" | "top" | "bottom";

export type CreatorSceneController = {
  reset(): void;
  zoom(direction: number): void;
  rotate(horizontal: number, vertical: number): void;
  highlight(id: CategoryId | null): void;
  press(id: CategoryId | null): void;
  activate(id: CategoryId): void;
  setView(view: Exclude<CreatorView, "free">): void;
  setBackdrop(visible: boolean): void;
  destroy(): void;
};

type SceneCallbacks = {
  project(points: { id: CategoryId; x: number; y: number }[], protectedAreas: { left: number; top: number; right: number; bottom: number }[]): void;
  hover(id: CategoryId | null): void;
  activate(id: CategoryId | null): void;
  navigate(id: CategoryId): void;
  unavailable(): void;
  view(view: CreatorView): void;
};

/** A bounded, lit miniature. Character motion and hover share one render clock. */
export function createCreatorScene(canvas: HTMLCanvasElement, callbacks: SceneCallbacks): CreatorSceneController {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Reuse the shadow map while only the camera moves. Character/hover changes
  // explicitly invalidate it, so animated silhouettes never leave stale shadows.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 50);
  camera.position.set(2.8, 5.6, 13);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 2.5, 0.1);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.15;
  controls.rotateSpeed = 0.60;
  controls.minPolarAngle = 0.03;
  controls.maxPolarAngle = Math.PI - 0.03;
  // Vertical touch movement still scrolls the page; horizontal movement orbits.
  canvas.style.touchAction = "pan-y";
  controls.update();
  controls.saveState();

  scene.add(new THREE.HemisphereLight(0xe6f2ff, 0xb09065, 0.55));
  const sunlight = new THREE.DirectionalLight(0xffefd6, 2.4);
  sunlight.position.set(-3.5, 8, 6);
  sunlight.target.position.set(0, 1.7, 0);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.left = -4.7;
  sunlight.shadow.camera.right = 4.7;
  sunlight.shadow.camera.top = 5.2;
  sunlight.shadow.camera.bottom = -4.2;
  sunlight.shadow.camera.near = 0.5;
  sunlight.shadow.camera.far = 24;
  sunlight.shadow.bias = -0.00018;
  sunlight.shadow.normalBias = 0.018;
  sunlight.shadow.radius = 3;
  const fill = new THREE.DirectionalLight(0xc6dcff, 0.48);
  fill.position.set(5, 4, 5);
  const rim = new THREE.DirectionalLight(0xffe5b2, 1.25);
  rim.position.set(1.5, 7, -5);
  scene.add(sunlight, sunlight.target, fill, rim);

  // A small neutral studio environment supplies controlled highlights to metal,
  // glass and ceramic. It is not a background or a mirror floor.
  const environmentScene = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(environmentScene, 0.05);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.24;
  environmentScene.dispose();
  pmrem.dispose();
  const corner = createCreatorCorner();
  const { root, hotspots } = corner;
  const backdrop = root.getObjectByName("creator-backdrop");
  const animate = "animate" in corner && typeof corner.animate === "function" ? corner.animate as (seconds: number) => boolean : undefined;
  scene.add(root);
  const baseScales = hotspots.map((hotspot) => hotspot.group.scale.clone());
  const protectedObjects = [root.getObjectByName("creator-cat-head"), root.getObjectByName("creator-laptop")].filter((object): object is THREE.Object3D => !!object);
  const objectBounds = new THREE.Box3();
  const scales = hotspots.map(() => 1);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let disposed = false;
  let frame = 0;
  let activationTimer = 0;
  let width = 1;
  let height = 1;
  let visible = true;
  let projectDirty = true;
  let dirty = true;
  let previousFrame = 0;
  let previousAnimation = 0;
  let active: CategoryId | null = null;
  let down: CategoryId | null = null;
  let navigating = false;
  let currentView: CreatorView = "free";
  let pressed: { x: number; y: number; id: number; moved: boolean; target: CategoryId | null } | null = null;
  const pointers = new Set<number>();
  const projected = new THREE.Vector3();
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  function draw() {
    renderer.render(scene, camera);
    if (projectDirty) {
      const protectedAreas = protectedObjects.map((object) => {
        objectBounds.setFromObject(object);
        const bounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
        for (const x of [objectBounds.min.x, objectBounds.max.x]) for (const y of [objectBounds.min.y, objectBounds.max.y]) for (const z of [objectBounds.min.z, objectBounds.max.z]) {
          projected.set(x, y, z).project(camera);
          const screenX = (projected.x + 1) * width / 2;
          const screenY = (1 - projected.y) * height / 2;
          bounds.left = Math.min(bounds.left, screenX);
          bounds.top = Math.min(bounds.top, screenY);
          bounds.right = Math.max(bounds.right, screenX);
          bounds.bottom = Math.max(bounds.bottom, screenY);
        }
        return bounds;
      });
      callbacks.project(hotspots.map((hotspot) => {
        projected.copy(hotspot.anchor).project(camera);
        return { id: hotspot.id, x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2 };
      }), protectedAreas);
      projectDirty = false;
    }
    dirty = false;
  }

  function recordModelSignature() {
    // Inspection proof: the same vertex buffers and world transforms are used
    // for every orthographic view. Camera and optional visibility are excluded.
    root.updateWorldMatrix(true, true);
    let hash = 2166136261;
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const values = [object.geometry.id, object.geometry.attributes.position.count, ...object.matrixWorld.elements.map(n => Math.round(n * 100000))];
      for (const value of values) hash = Math.imul(hash ^ value, 16777619);
    });
    canvas.dataset.modelSignature = String(hash >>> 0);
  }

  function resumeOrbit() {
    if (currentView === "free") return;
    currentView = "free";
    camera.up.set(0, 1, 0);
    controls.enableDamping = false;
    controls.update();
    controls.enableDamping = true;
    callbacks.view("free");
    canvas.dataset.view = "free";
    requestRender();
  }

  function setView(view: Exclude<CreatorView, "free">) {
    if (disposed) return;
    // Drain inertia, then place the camera without allowing OrbitControls to
    // clamp the true top/bottom axes. Controls resume on the next drag/key orbit.
    controls.enableDamping = false;
    controls.update();
    controls.enableDamping = true;
    currentView = view;
    press(null); highlight(null);
    for (let i = 0; i < hotspots.length; i++) { scales[i] = 1; hotspots[i].group.scale.copy(baseScales[i]); }
    animate?.(0);
    const target = new THREE.Vector3(0, view === "top" || view === "bottom" ? 0.1 : 2.5, 0.1);
    const direction: Record<Exclude<CreatorView, "free">, [number, number, number]> = {
      front: [0, 0, 1], left: [-1, 0, 0], right: [1, 0, 0], back: [0, 0, -1], top: [0, 1, 0], bottom: [0, -1, 0],
    };
    controls.target.copy(target);
    camera.position.copy(target).addScaledVector(new THREE.Vector3(...direction[view]), 15);
    camera.up.set(0, view === "top" || view === "bottom" ? 0 : 1, view === "top" ? -1 : view === "bottom" ? 1 : 0);
    camera.lookAt(target);
    camera.zoom = 1;
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    renderer.shadowMap.needsUpdate = true;
    projectDirty = true;
    canvas.dataset.view = view;
    canvas.dataset.camera = JSON.stringify(camera.position.toArray());
    recordModelSignature();
    callbacks.view(view);
    requestRender();
  }

  function queueFrame() {
    if (disposed || frame || !visible || document.hidden) return;
    frame = requestAnimationFrame(tick);
  }

  function requestRender() {
    dirty = true;
    queueFrame();
  }

  function tick(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const elapsed = Math.min(0.05, Math.max(0.001, (now - previousFrame) / 1000));
    previousFrame = now;
    const cameraChanged = currentView === "free" ? controls.update() : false;
    projectDirty ||= cameraChanged;
    let settling = false;
    let objectsChanged = false;
    hotspots.forEach((hotspot, index) => {
      const goal = down === hotspot.id ? 0.98 : active === hotspot.id ? 1.045 : 1;
      const distance = goal - scales[index];
      if (Math.abs(distance) > 0.0001) {
        scales[index] = reducedMotion.matches ? goal : scales[index] + distance * (1 - Math.exp(-18 * elapsed));
        hotspot.group.scale.copy(baseScales[index]).multiplyScalar(scales[index]);
        settling = !reducedMotion.matches;
        objectsChanged = true;
      } else if (scales[index] !== goal) {
        scales[index] = goal;
        hotspot.group.scale.copy(baseScales[index]).multiplyScalar(goal);
        objectsChanged = true;
      }
    });
    // Breathing and blinking are sampled at 30 Hz; camera damping stays at the
    // display cadence. Reduced-motion visitors retain an entirely still scene.
    const animateNow = currentView === "free" && !!animate && !reducedMotion.matches && now - previousAnimation >= 1000 / 30;
    if (animateNow) {
      objectsChanged = animate!(now / 1000) || objectsChanged;
      previousAnimation = now;
    }
    if (objectsChanged) renderer.shadowMap.needsUpdate = true;
    if (dirty || objectsChanged || cameraChanged) draw();
    if (settling || cameraChanged || (currentView === "free" && animate && !reducedMotion.matches)) queueFrame();
  }

  function highlight(id: CategoryId | null) {
    if (disposed || active === id) return;
    active = id;
    canvas.style.cursor = id ? "pointer" : "grab";
    callbacks.hover(id);
    requestRender();
  }

  function press(id: CategoryId | null) {
    if (disposed || navigating || down === id) return;
    down = id;
    requestRender();
  }

  function activate(id: CategoryId) {
    if (disposed || navigating) return;
    navigating = true;
    down = id;
    highlight(id);
    callbacks.activate(id);
    requestRender();
    activationTimer = window.setTimeout(() => {
      activationTimer = 0;
      if (!disposed) callbacks.navigate(id);
    }, reducedMotion.matches ? 0 : 110);
  }

  function pick(event: PointerEvent): CategoryId | null {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    root.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    // The first opaque object owns the hit: objects behind the cat or sofa must
    // not activate through it. Decorative outline shells are not hit targets.
    const hit = raycaster.intersectObject(root, true).find((entry) => {
      if (entry.object.userData.noPick) return false;
      for (let ancestor: THREE.Object3D | null = entry.object; ancestor; ancestor = ancestor.parent) if (!ancestor.visible) return false;
      return true;
    });
    let object: THREE.Object3D | null = hit?.object ?? null;
    while (object) {
      if (object.userData.category) return object.userData.category as CategoryId;
      object = object.parent;
    }
    return null;
  }

  const pointerDown = (event: PointerEvent) => {
    pointers.add(event.pointerId);
    if (pointers.size > 1) { if (pressed) pressed.moved = true; press(null); return; }
    if (!event.isPrimary || event.button !== 0 || navigating) return;
    resumeOrbit();
    const target = pick(event);
    pressed = { x: event.clientX, y: event.clientY, id: event.pointerId, moved: false, target };
    press(target);
    highlight(target);
    canvas.style.cursor = "grabbing";
  };
  const pointerMove = (event: PointerEvent) => {
    if (pressed) {
      if (pressed.id === event.pointerId && Math.hypot(pressed.x - event.clientX, pressed.y - event.clientY) > 6) {
        pressed.moved = true;
        press(null);
        highlight(null);
      }
    } else if (event.isPrimary) highlight(pick(event));
  };
  const pointerUp = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (pressed?.id !== event.pointerId) return;
    const start = pressed;
    pressed = null;
    press(null);
    canvas.style.cursor = "grab";
    if (start.moved || Math.hypot(start.x - event.clientX, start.y - event.clientY) > 6) return;
    const id = pick(event);
    if (id && id === start.target) activate(id);
  };
  const pointerCancel = () => { pressed = null; pointers.clear(); press(null); highlight(null); canvas.style.cursor = "grab"; };
  const pointerLeave = () => { if (!pressed) highlight(null); };
  const onControlChange = () => { projectDirty = true; requestRender(); };
  const visibilityChanged = () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; pointerCancel(); }
    else { previousFrame = performance.now(); requestRender(); }
  };
  const motionChanged = () => { previousAnimation = 0; requestRender(); };
  const contextLost = (event: Event) => {
    event.preventDefault();
    destroy();
    callbacks.unavailable();
  };
  controls.addEventListener("change", onControlChange);
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerCancel);
  canvas.addEventListener("pointerleave", pointerLeave);
  canvas.addEventListener("webglcontextlost", contextLost);
  window.addEventListener("blur", pointerCancel);
  document.addEventListener("visibilitychange", visibilityChanged);
  reducedMotion.addEventListener("change", motionChanged);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const aspect = width / height;
    const span = 7.6 / Math.min(1, aspect);
    camera.left = -span * aspect / 2;
    camera.right = span * aspect / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    projectDirty = true;
    // Resize clears the buffer; repaint synchronously to avoid a blank frame.
    draw();
  };
  const observer = new ResizeObserver(() => { if (!disposed) resize(); });
  observer.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { previousFrame = performance.now(); requestRender(); }
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  intersection.observe(canvas);
  resize();
  queueFrame();

  function destroy() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    clearTimeout(activationTimer);
    observer.disconnect();
    intersection.disconnect();
    controls.removeEventListener("change", onControlChange);
    controls.dispose();
    canvas.removeEventListener("pointerdown", pointerDown);
    canvas.removeEventListener("pointermove", pointerMove);
    canvas.removeEventListener("pointerup", pointerUp);
    canvas.removeEventListener("pointercancel", pointerCancel);
    canvas.removeEventListener("pointerleave", pointerLeave);
    canvas.removeEventListener("webglcontextlost", contextLost);
    window.removeEventListener("blur", pointerCancel);
    document.removeEventListener("visibilitychange", visibilityChanged);
    reducedMotion.removeEventListener("change", motionChanged);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material);
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
      }
    });
    const retiredGeometries = root.userData.retiredGeometries as Set<THREE.BufferGeometry> | undefined;
    retiredGeometries?.forEach((geometry) => geometries.add(geometry));
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    sunlight.shadow.dispose();
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  return {
    reset() {
      if (disposed) return;
      press(null);
      highlight(null);
      currentView = "free";
      camera.up.set(0, 1, 0);
      callbacks.view("free");
      canvas.dataset.view = "free";
      // Clear drag inertia before restoring the saved camera exactly.
      controls.enableDamping = false;
      controls.update();
      controls.reset();
      controls.enableDamping = true;
      projectDirty = true;
      requestRender();
    },
    zoom(direction) {
      if (disposed) return;
      camera.zoom = THREE.MathUtils.clamp(camera.zoom + direction * 0.12, 0.8, 1.6);
      camera.updateProjectionMatrix();
      projectDirty = true;
      requestRender();
    },
    rotate(horizontal, vertical) {
      if (disposed) return;
      resumeOrbit();
      highlight(null);
      controls.rotateLeft(horizontal);
      controls.rotateUp(vertical);
      requestRender();
    },
    highlight,
    press,
    activate,
    setView,
    setBackdrop(visible) {
      if (disposed || !backdrop) return;
      backdrop.visible = visible;
      canvas.dataset.backdrop = visible ? "visible" : "hidden";
      renderer.shadowMap.needsUpdate = true;
      requestRender();
    },
    destroy,
  };
}
