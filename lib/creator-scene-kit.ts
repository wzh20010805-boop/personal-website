import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export type Point = [number, number, number];
export type Surface = "fur" | "fabric" | "plastic" | "paper" | "metal" | "ceramic" | "ink" | "glow";
const ink = "#263438";

/** Shared art materials and modest-resolution, smooth sculpting primitives. */
export function createSculptKit() {
  const materials = new Map<string, THREE.Material>();
  const sphere = new THREE.SphereGeometry(1, 40, 28);
  const outline = new THREE.MeshBasicMaterial({ color: ink, side: THREE.BackSide });
  const ramp = new THREE.DataTexture(new Uint8Array([105, 165, 218, 255]), 4, 1, THREE.RedFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  let seed = 718;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const weaveCanvas = document.createElement("canvas");
  weaveCanvas.width = weaveCanvas.height = 256;
  const weave = weaveCanvas.getContext("2d")!;
  const pixels = weave.createImageData(256, 256);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const x = (i / 4) % 256, y = Math.floor(i / 1024);
    const value = 143 + Math.sin(x * Math.PI / 2) * 22 + Math.cos(y * Math.PI / 2) * 22 + random() * 22;
    pixels.data.set([value, value, value, 255], i);
  }
  weave.putImageData(pixels, 0, 0);
  const weaveMap = new THREE.CanvasTexture(weaveCanvas);
  weaveMap.wrapS = weaveMap.wrapT = THREE.RepeatWrapping;
  weaveMap.repeat.set(4, 4);
  // Bump data stays linear; color CanvasTextures below are explicitly sRGB.
  const paperCanvas = document.createElement("canvas");
  paperCanvas.width = paperCanvas.height = 256;
  const paper = paperCanvas.getContext("2d")!;
  paper.fillStyle = "#ffffff"; paper.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5000; i++) {
    paper.fillStyle = `rgba(67,51,36,${random() * 0.065})`;
    paper.fillRect(random() * 256, random() * 256, 1, 1);
  }
  const paperMap = new THREE.CanvasTexture(paperCanvas);
  paperMap.colorSpace = THREE.SRGBColorSpace;
  function material(color: string, surface: Surface = "plastic") {
    const key = color + surface;
    let result = materials.get(key);
    if (result) return result;
    if (surface === "ink") result = new THREE.MeshToonMaterial({ color, gradientMap: ramp });
    else if (surface === "glow") result = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.65, roughness: 0.35 });
    else {
      const roughness = { fur: 0.94, fabric: 0.96, plastic: 0.37, paper: 0.85, metal: 0.31, ceramic: 0.24 }[surface];
      result = new THREE.MeshStandardMaterial({ color, roughness, metalness: surface === "metal" ? 0.48 : 0, map: surface === "paper" ? paperMap : null,
        bumpMap: surface === "fabric" ? weaveMap : null, bumpScale: surface === "fabric" ? 0.018 : 0 });
    }
    materials.set(key, result);
    return result;
  }
  function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, color: string, position: Point, surface: Surface = "plastic", outlined = false) {
    const result = new THREE.Mesh(geometry, material(color, surface));
    result.position.set(...position); result.castShadow = result.receiveShadow = true; parent.add(result);
    if (outlined) {
      const edge = new THREE.Mesh(geometry, outline); edge.scale.setScalar(1.018);
      edge.userData.outline = true; edge.userData.noPick = true; result.add(edge);
    }
    return result;
  }
  function group(parent: THREE.Object3D, position: Point, yaw = 0) {
    const result = new THREE.Group(); result.position.set(...position); result.rotation.y = yaw; parent.add(result); return result;
  }
  function ball(parent: THREE.Object3D, size: Point, position: Point, color: string, surface: Surface = "plastic", outlined = false) {
    const result = mesh(parent, sphere, color, position, surface, outlined); result.scale.set(...size); return result;
  }
  function box(parent: THREE.Object3D, size: Point, position: Point, color: string, radius = 0.08, surface: Surface = "plastic", outlined = false) {
    return mesh(parent, new RoundedBoxGeometry(...size, 3, Math.min(radius, ...size.map(n => n / 2))), color, position, surface, outlined);
  }
  function stroke(parent: THREE.Object3D, points: Point[], color = ink, radius = 0.018, surface: Surface = "ink") {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return mesh(parent, new THREE.TubeGeometry(curve, Math.max(8, points.length * 5), radius, 8, false), color, [0, 0, 0], surface);
  }
  function cylinder(parent: THREE.Object3D, radius: number, height: number, position: Point, color: string, surface: Surface = "plastic") {
    return mesh(parent, new THREE.CylinderGeometry(radius, radius, height, 40), color, position, surface);
  }
  function relief(parent: THREE.Object3D, shape: THREE.Shape, position: Point, color: string, depth = 0.16, bevel = 0.04, surface: Surface = "plastic", outlined = false) {
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: true, bevelSegments: 4, bevelSize: bevel, bevelThickness: bevel, curveSegments: 20 });
    geometry.translate(0, 0, -depth / 2);
    return mesh(parent, geometry, color, position, surface, outlined);
  }
  function lettering(parent: THREE.Object3D, text: string, size: [number, number], position: Point, color = ink) {
    const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = Math.max(64, Math.round(512 * size[1] / size[0]));
    const context = canvas.getContext("2d")!;
    context.fillStyle = color; context.font = `900 ${canvas.height * 0.70}px "Arial Narrow", "Microsoft YaHei", sans-serif`;
    context.textAlign = "center"; context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height * 0.53, canvas.width * 0.96);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    const result = new THREE.Mesh(new THREE.PlaneGeometry(...size), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }));
    result.position.set(...position); parent.add(result); return result;
  }
  function star(parent: THREE.Object3D, position: Point, radius: number, color = "#ffd63f") {
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + i * Math.PI / 5, r = radius * (i % 2 ? 0.46 : 1);
      if (i) shape.lineTo(Math.cos(a) * r, Math.sin(a) * r); else shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.closePath(); return relief(parent, shape, position, color, 0.07, 0.018, "plastic", true);
  }
  function emblem(parent: THREE.Object3D, position: Point, scale: number) {
    const g = group(parent, position); g.scale.setScalar(scale);
    ball(g, [0.4, 0.4, 0.022], [0, 0, 0], ink, "ink");
    const s = new THREE.Shape(); s.moveTo(-0.2, 0.02); s.lineTo(-0.21, 0.24); s.lineTo(-0.06, 0.17); s.quadraticCurveTo(0.02, 0.20, 0.08, 0.17);
    s.lineTo(0.21, 0.24); s.lineTo(0.21, 0.02); s.bezierCurveTo(0.24, -0.15, 0.08, -0.18, 0.08, -0.22); s.lineTo(0.08, -0.32); s.lineTo(-0.08, -0.32); s.lineTo(-0.08, -0.21); s.bezierCurveTo(-0.25, -0.18, -0.25, -0.12, -0.2, 0.02);
    relief(g, s, [0, 0, 0.026], "#fff7de", 0.008, 0.004, "paper");
    stroke(g, [[-0.05, -0.23, 0.04], [-0.23, -0.24, 0.04], [-0.29, -0.13, 0.04]], "#fff7de", 0.025);
  }
  return { material, mesh, group, ball, box, cylinder, stroke, relief, lettering, star, emblem };
}
export type SculptKit = ReturnType<typeof createSculptKit>;

/** Merge only inside one fixed semantic group; moving characters and entry IDs survive. */
export function batchStaticGroup(root: THREE.Group) {
  root.updateWorldMatrix(true, true);
  // Flatten first so transparent or unique children survive merging a parent.
  const meshes: THREE.Mesh[] = [];
  root.traverse(object => { if (object instanceof THREE.Mesh) meshes.push(object); });
  for (const object of meshes) root.attach(object);
  const inverse = root.matrixWorld.clone().invert();
  const batches = new Map<string, { material: THREE.Material; cast: boolean; receive: boolean; parts: THREE.BufferGeometry[]; objects: THREE.Mesh[] }>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material) || object.material.transparent) return;
    const key = object.material.uuid + object.castShadow + object.receiveShadow + !!object.userData.noPick;
    if (!batches.has(key)) batches.set(key, { material: object.material, cast: object.castShadow, receive: object.receiveShadow, parts: [], objects: [] });
    const batch = batches.get(key)!;
    const geometry = object.geometry.clone().applyMatrix4(inverse.clone().multiply(object.matrixWorld));
    batch.parts.push(geometry.index ? geometry.toNonIndexed() : geometry);
    if (geometry.index) geometry.dispose();
    batch.objects.push(object);
  });
  const removed = new Set<THREE.BufferGeometry>();
  for (const batch of batches.values()) {
    if (batch.parts.length < 2) { batch.parts.forEach(g => g.dispose()); continue; }
    const merged = mergeGeometries(batch.parts); batch.parts.forEach(g => g.dispose());
    if (!merged) continue;
    const result = new THREE.Mesh(merged, batch.material); result.castShadow = batch.cast; result.receiveShadow = batch.receive;
    result.userData.noPick = batch.objects[0].userData.noPick;
    // Children are processed independently, so removing parents is safe after gathering.
    for (const object of batch.objects) { object.removeFromParent(); removed.add(object.geometry); }
    root.add(result);
  }
  // Some source geometries are shared with other semantic groups. The owner's
  // returned cleanup list releases those originals exactly once at final disposal.
  return removed;
}
