import * as THREE from "three";
import type { CategoryId } from "@/data/categories";
import { createSculptKit, batchStaticGroup, type Point } from "./creator-scene-kit";
import { createCreatorProps } from "./creator-scene-props";

export interface CreatorHotspot { id: CategoryId; group: THREE.Group; anchor: THREE.Vector3 }
const fur = "#397589", cream = "#fff2d4", ink = "#243439", yellow = "#f4bd27";

/** A complete miniature: sculpted volumes, independent characters and six entries. */
export function createCreatorCorner() {
  const kit = createSculptKit();
  const { group, mesh, ball, box, stroke, cylinder, relief, emblem } = kit;
  const root = new THREE.Group(); root.name = "creator-corner";
  const fixed = group(root, [0, 0, 0]); fixed.name = "miniature-stage";
  const backdropGroup = group(root, [0, 0, 0]); backdropGroup.name = "creator-backdrop";
  const retired = new Set<THREE.BufferGeometry>();

  function sculpt(parent: THREE.Object3D, size: Point, position: Point, color: string, exponent = 2.4,
    surface: "fur" | "fabric" = "fur", deform?: (x: number, y: number, z: number) => Point) {
    const geometry = new THREE.SphereGeometry(1, 56, 36);
    const vertices = geometry.attributes.position;
    const power = (n: number) => Math.sign(n) * Math.abs(n) ** (2 / exponent);
    for (let i = 0; i < vertices.count; i++) {
      let x = power(vertices.getX(i)), y = power(vertices.getY(i)), z = power(vertices.getZ(i));
      if (deform) [x, y, z] = deform(x, y, z);
      vertices.setXYZ(i, x * size[0], y * size[1], z * size[2]);
    }
    geometry.computeVertexNormals();
    return mesh(parent, geometry, color, position, surface);
  }
  function limb(parent: THREE.Object3D, points: Point[], radii: number[], color: string) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const segments = 36, sides = 16, frames = curve.computeFrenetFrames(segments, false);
    const vertices: number[] = [], uv: number[] = [], indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments, p = curve.getPointAt(t), index = t * (radii.length - 1);
      const radius = THREE.MathUtils.lerp(radii[Math.floor(index)], radii[Math.min(Math.floor(index) + 1, radii.length - 1)], index % 1);
      for (let j = 0; j <= sides; j++) {
        const a = j / sides * Math.PI * 2;
        const v = p.clone().addScaledVector(frames.normals[i], Math.cos(a) * radius).addScaledVector(frames.binormals[i], Math.sin(a) * radius);
        vertices.push(...v.toArray()); uv.push(j / sides, t);
        if (i < segments && j < sides) { const k = i * (sides + 1) + j; indices.push(k, k + 1, k + sides + 1, k + 1, k + sides + 2, k + sides + 1); }
      }
    }
    // Close both ends so side, top and underside inspection never sees a hollow tube.
    const startCap = vertices.length / 3; vertices.push(...curve.getPointAt(0).toArray()); uv.push(0.5, 0);
    const endCap = vertices.length / 3; vertices.push(...curve.getPointAt(1).toArray()); uv.push(0.5, 1);
    for (let j = 0; j < sides; j++) {
      indices.push(startCap, j + 1, j);
      const k = segments * (sides + 1) + j; indices.push(endCap, k, k + 1);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3)); geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
    return mesh(parent, geometry, color, [0, 0, 0], "fur");
  }
  function ear(parent: THREE.Object3D, side: number, position: Point, size = 1, color = fur) {
    const g = group(parent, position); g.scale.set(size, size, size); g.rotation.z = -side * 0.18;
    const vertices: number[] = [], uv: number[] = [], indices: number[] = [];
    const rings = 22, sides = 28;
    for (let i = 0; i <= rings; i++) {
      const t = i / rings, width = 0.37 * (1 - t) ** 0.82 + 0.014;
      for (let j = 0; j <= sides; j++) {
        const a = j / sides * Math.PI * 2;
        vertices.push(side * t * 0.13 + Math.cos(a) * width, t * 0.82, -t * 0.13 + Math.sin(a) * width * 0.68);
        uv.push(j / sides, t);
        if (i < rings && j < sides) { const k = i * (sides + 1) + j; indices.push(k, k + sides + 1, k + 1, k + 1, k + sides + 1, k + sides + 2); }
      }
    }
    const tip = vertices.length / 3; vertices.push(side * 0.13, 0.835, -0.13); uv.push(0.5, 1);
    for (let j = 0; j < sides; j++) { const k = rings * (sides + 1) + j; indices.push(tip, k + 1, k); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3)); geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
    mesh(g, geometry, color, [0, 0, 0], "fur");
    // Inner pink tissue follows the cone surface rather than a floating flat triangle.
    const innerVertices: number[] = [], innerUV: number[] = [], innerIndices: number[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = 0.12 + i / 20 * 0.72, width = 0.37 * (1 - t) ** 0.82 + 0.014;
      const span = 0.77 * Math.sin(Math.PI * (i + 1) / 22) ** 0.5;
      for (let j = 0; j <= 12; j++) {
        const a = Math.PI / 2 + (j / 12 * 2 - 1) * span;
        innerVertices.push(side * t * 0.13 + Math.cos(a) * width * 1.012, t * 0.82, -t * 0.13 + Math.sin(a) * width * 0.68 + 0.006);
        innerUV.push(j / 12, i / 20);
        if (i < 20 && j < 12) { const k = i * 13 + j; innerIndices.push(k, k + 13, k + 1, k + 1, k + 13, k + 14); }
      }
    }
    const innerGeometry = new THREE.BufferGeometry(); innerGeometry.setAttribute("position", new THREE.Float32BufferAttribute(innerVertices, 3)); innerGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(innerUV, 2)); innerGeometry.setIndex(innerIndices); innerGeometry.computeVertexNormals();
    mesh(g, innerGeometry, "#eaa3b3", [0, 0, 0], "fur");
    for (const x of [-0.13, -0.035, 0.06]) ball(g, [0.05, 0.075, 0.035], [x, 0.13, 0.20], cream, "fur").rotation.z = -0.4;
    return g;
  }

  // A warm ivory exhibition base, inset rose rug and tactile stitched border.
  // The turntable is circular in world space; it becomes an ellipse only in projection.
  cylinder(fixed, 3.48, 0.22, [0, -0.025, 0.15], "#dfcaa2", "ceramic");
  cylinder(fixed, 3.44, 0.065, [0, 0.112, 0.15], "#fff3d8", "ceramic");
  cylinder(fixed, 3.32, 0.022, [0, 0.159, 0.15], "#ee9aaa", "fabric");
  const underside = mesh(fixed, new THREE.TorusGeometry(3.21, 0.025, 8, 96), "#cbb799", [0, -0.142, 0.15], "ceramic"); underside.rotation.x = Math.PI / 2;
  box(fixed, [1.25, 0.018, 0.65], [0, -0.146, 0.15], "#cbbca5", 0.06, "plastic");
  for (const x of [-1.95, 1.95]) for (const z of [-1.80, 2.10]) {
    cylinder(fixed, 0.25, 0.025, [x, -0.15, z], "#e9d9bc", "ceramic");
    cylinder(fixed, 0.185, 0.07, [x, -0.185, z], "#4a4b48", "plastic");
  }
  // The illustration's pink halftone is a shallow decorative backdrop only;
  // the characters and furniture remain complete free-standing 3D models.
  const backdropCanvas = document.createElement("canvas"); backdropCanvas.width = backdropCanvas.height = 512;
  const backdropContext = backdropCanvas.getContext("2d")!;
  const gradient = backdropContext.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, "#f974a0"); gradient.addColorStop(1, "#e94f8b");
  backdropContext.fillStyle = gradient; backdropContext.fillRect(0, 0, 512, 512);
  for (let y = 5; y < 512; y += 10) for (let x = 5; x < 512; x += 10) {
    backdropContext.fillStyle = `rgba(142,32,76,${0.035 + y / 512 * 0.065})`;
    backdropContext.beginPath(); backdropContext.arc(x + (y % 20 ? 5 : 0), y, 1.1, 0, Math.PI * 2); backdropContext.fill();
  }
  const backdropMap = new THREE.CanvasTexture(backdropCanvas); backdropMap.colorSpace = THREE.SRGBColorSpace;
  const backdrop = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.45, 0.12, 96), new THREE.MeshStandardMaterial({ map: backdropMap, roughness: 0.94, color: "#ffffff" }));
  backdrop.position.set(0, 2.75, -1.42); backdrop.rotation.x = Math.PI / 2;
  backdropGroup.add(backdrop);
  const backRim = mesh(backdropGroup, new THREE.TorusGeometry(2.43, 0.035, 8, 96), "#f09bb6", [0, 2.75, -1.49], "plastic"); backRim.castShadow = false;
  for (const x of [-1.05, 1.05]) {
    box(backdropGroup, [0.13, 0.68, 0.12], [x, 0.49, -1.48], "#bb929b", 0.035, "metal");
    box(backdropGroup, [0.38, 0.055, 0.38], [x, 0.20, -1.48], "#caa7a8", 0.035, "metal");
    ball(backdropGroup, [0.04, 0.04, 0.018], [x, 0.69, -1.56], "#b2b0a3", "metal");
  }
  const rugEdge = new THREE.EllipseCurve(0, 0, 3.23, 3.23, 0, Math.PI * 2, false);
  stroke(fixed, rugEdge.getPoints(100).map(p => [p.x, 0.176, p.y + 0.15]), "#ffd9df", 0.018, "fabric");
  for (let i = 0; i < 80; i++) {
    const a = i / 80 * Math.PI * 2;
    stroke(fixed, [[Math.cos(a) * 3.27, 0.173, Math.sin(a) * 3.27 + 0.15], [Math.cos(a) * 3.31, 0.173, Math.sin(a) * 3.31 + 0.15]], "#fff0d5", 0.014, "fabric");
  }

  // Plush superellipsoid cushions: rounded rectangles, not stacked spheres.
  const sofa = group(fixed, [0.08, 0, -0.02]); sofa.name = "yellow-sofa";
  for (const x of [-1.26, 1.26]) for (const z of [-0.68, 0.87]) {
    const leg = cylinder(sofa, 0.11, 0.27, [x, 0.31, z], "#997044", "paper"); leg.rotation.z = x * -0.045;
    cylinder(sofa, 0.114, 0.045, [x, 0.193, z], "#be975d", "metal");
  }
  sculpt(sofa, [1.58, 0.27, 1.02], [0, 0.63, 0.12], "#dca124", 3.6, "fabric");
  const back = sculpt(sofa, [1.45, 0.93, 0.35], [0, 1.66, -0.65], yellow, 3.3, "fabric", (x, y, z) => {
    const dent = Math.exp(-((x - 0.38) ** 2 + (y + 0.13) ** 2) * 25) + Math.exp(-((x + 0.38) ** 2 + (y + 0.13) ** 2) * 25);
    return [x, y, z > 0 ? z - dent * 0.15 : z];
  }); back.rotation.x = -0.09;
  sculpt(sofa, [1.26, 0.24, 0.88], [0, 1.0, 0.28], "#ffd34e", 3.8, "fabric", (x, y, z) => [x, y > 0 ? y - 0.16 * Math.exp(-(x * x + z * z) * 2) : y, z]);
  for (const side of [-1, 1]) {
    sculpt(sofa, [0.32, 0.53, 0.98], [side * 1.43, 1.04, 0.18], yellow, 3, "fabric");
    const piping: Point[] = [];
    for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; piping.push([side * 1.43 + Math.cos(a) * 0.245, 1.485 + Math.sin(a) * 0.012, 0.18 + Math.sin(a) * 0.91]); }
    stroke(sofa, piping, "#f7d66a", 0.017, "fabric");
    for (const z of [0.55, 0.72]) stroke(sofa, [[side * 1.60, 1.35, z], [side * 1.63, 1.29, z + 0.05], [side * 1.65, 1.2, z + 0.10]], "#c69531", 0.009, "fabric");
  }
  stroke(sofa, [[-1.16, 1.08, 1.08], [-0.6, 0.99, 1.15], [0.60, 0.99, 1.15], [1.16, 1.08, 1.08]], "#b98a24", 0.015, "fabric");
  stroke(sofa, [[-1.31, 1.3, -0.29], [-1.36, 2.32, -0.36], [-0.78, 2.51, -0.43], [0.78, 2.51, -0.43], [1.36, 2.32, -0.36], [1.31, 1.3, -0.29]], "#ffe38b", 0.019, "fabric");
  for (const x of [-0.55, 0.55]) ball(sofa, [0.057, 0.057, 0.022], [x, 1.55, -0.305], "#ce9a2b", "fabric");
  // Rear upholstery and seam are real geometry, visible when the rear board is hidden.
  stroke(sofa, [[-1.28, 1.02, -0.96], [-1.35, 2.30, -0.96], [-0.85, 2.48, -0.95], [0.85, 2.48, -0.95], [1.35, 2.30, -0.96], [1.28, 1.02, -0.96]], "#d9a434", 0.012, "fabric");
  stroke(sofa, [[-1.31, 0.60, -0.90], [-0.6, 0.51, -0.91], [0.6, 0.51, -0.91], [1.31, 0.60, -0.90]], "#ba8828", 0.013, "fabric");

  const cat = group(root, [0, 0, 0]); cat.name = "blue-gray-cat";
  const torso = group(cat, [0.18, 1.83, 0.12]);
  sculpt(torso, [0.63, 0.83, 0.56], [0, 0, 0], fur, 2.35, "fur", (x, y, z) => [x * (1 - y * 0.12) + y * 0.12, y, z]);
  const bib = sculpt(torso, [0.43, 0.58, 0.19], [-0.06, -0.04, 0.43], cream, 2.4); bib.rotation.z = -0.14;
  sculpt(cat, [0.69, 0.32, 0.52], [-0.03, 1.22, 0.54], fur, 2.6);
  // Curved tapered limbs blend into the body, while feet rest against the cushion.
  limb(cat, [[-0.22, 1.31, 0.45], [-0.58, 1.265, 0.79], [-0.75, 1.305, 1.10], [-0.94, 1.40, 1.37]], [0.34, 0.32, 0.27, 0.21], fur);
  limb(cat, [[0.20, 1.29, 0.48], [0.39, 1.29, 0.86], [0.35, 1.15, 1.24], [0.17, 1.04, 1.61]], [0.34, 0.33, 0.29, 0.22], fur);
  function paw(position: Point, size: number, angle: number, pads: boolean) {
    const g = group(cat, position); g.scale.setScalar(size); g.rotation.z = angle; g.rotation.y = -0.12;
    sculpt(g, [0.31, 0.46, 0.235], [0, 0, 0], cream, 2.5);
    if (pads) {
      ball(g, [0.135, 0.19, 0.025], [0, -0.10, 0.233], "#eb72a1", "fur");
      for (const [x, y, a] of [[-0.15, 0.16, -0.3], [0, 0.245, 0], [0.15, 0.16, 0.3]]) ball(g, [0.063, 0.093, 0.027], [x, y, 0.20], "#f387b0", "fur").rotation.z = a;
    } else for (const x of [-0.08, 0.08]) stroke(g, [[x, 0.30, 0.17], [x - 0.01, 0.19, 0.226], [x + 0.04, 0.13, 0.231]], "#9d9a83", 0.013);
    return g;
  }
  paw([-0.97, 1.40, 1.48], 1.02, 0.26, true);
  paw([0.15, 1.02, 1.76], 1.0, -0.13, true);
  // Relaxed arms meet the keyboard on both sides instead of floating above it.
  limb(cat, [[0.68, 2.24, 0.18], [0.83, 2.03, 0.56], [0.49, 1.81, 1.03]], [0.24, 0.22, 0.16], fur);
  limb(cat, [[-0.26, 2.22, 0.12], [-0.54, 2.00, 0.49], [-0.58, 1.79, 1.04]], [0.22, 0.20, 0.14], fur);
  for (const [x, y] of [[0.46, 1.80], [-0.57, 1.79]]) {
    sculpt(cat, [0.20, 0.145, 0.23], [x, y, 1.12], cream, 2.6);
    for (const dx of [-0.065, 0.05]) stroke(cat, [[x + dx, y + 0.02, 1.34], [x + dx, y - 0.04, 1.34], [x + dx + 0.03, y - 0.09, 1.30]], "#8b9283", 0.010);
  }
  const tail = group(cat, [0.62, 1.27, -0.17]);
  limb(tail, [[0, 0, 0], [0.45, 0.05, 0.04], [0.52, 0.48, 0.05], [0.34, 0.72, 0.12]], [0.18, 0.17, 0.15, 0.09], fur);
  ball(tail, [0.12, 0.13, 0.12], [0.34, 0.72, 0.12], fur, "fur");

  const head = group(cat, [0.23, 3.04, 0.18]); head.name = "creator-cat-head"; head.rotation.z = -0.08;
  sculpt(head, [0.94, 0.77, 0.66], [0, 0, 0], fur, 2.18, "fur", (x, y, z) => [x * (1 + Math.exp(-((y + 0.27) ** 2) * 12) * 0.12), y, z * (1 - Math.max(0, -y) * 0.08)]);
  ear(head, -1, [-0.61, 0.48, -0.06]); ear(head, 1, [0.61, 0.48, -0.06]);
  // Cheek tufts are rounded tapered volumes with an actual back surface.
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
    limb(head, [[side * (0.75 - i * 0.06), -0.08 - i * 0.17, 0.08], [side * (0.93 - i * 0.07), -0.12 - i * 0.17, 0.08], [side * (1.03 - i * 0.075), -0.08 - i * 0.22, 0.02]], [0.145, 0.10, 0.009], fur);
  }
  for (let i = 0; i < 3; i++) limb(head, [[-0.15 + i * 0.18, 0.65, -0.02], [-0.19 + i * 0.18, 0.79, -0.03], [-0.17 + i * 0.22, 0.98 - i * 0.045, -0.06]], [0.12, 0.09, 0.008], fur);
  const chin = sculpt(head, [0.64, 0.33, 0.25], [0, -0.38, 0.43], cream, 2.5);
  chin.rotation.z = 0.02;
  for (const x of [-0.23, 0.23]) sculpt(head, [0.30, 0.20, 0.16], [x, -0.22, 0.57], cream, 2.4);
  const eyes: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const eye = group(head, [side * 0.40, 0.09, 0.57], side * 0.33); eyes.push(eye);
    const almond = new THREE.Shape(); almond.moveTo(-0.27, 0.11); almond.quadraticCurveTo(0, 0.20, 0.27, 0.09); almond.bezierCurveTo(0.22, -0.27, -0.23, -0.28, -0.27, 0.11);
    relief(eye, almond, [0, 0, 0], "#253537", 0.055, 0.025, "fur");
    const iris = relief(eye, almond, [0, -0.002, 0.033], "#eec42e", 0.028, 0.016, "ceramic"); iris.scale.set(0.87, 0.86, 1);
    ball(eye, [0.045, 0.144, 0.034], [-0.025, -0.043, 0.085], "#263332", "ceramic").rotation.z = -0.05;
    ball(eye, [0.038, 0.057, 0.010], [-0.083, 0.012, 0.111], "#fff8e4", "glow");
    ball(eye, [0.015, 0.021, 0.008], [0.065, -0.10, 0.090], "#fff8e4", "glow");
    stroke(eye, [[-0.28, 0.12, 0.052], [0, 0.16, 0.07], [0.28, 0.10, 0.05]], ink, 0.028);
    stroke(head, [[side * 0.23, 0.44, 0.57], [side * 0.40, 0.50, 0.51], [side * 0.55, 0.42, 0.48]], "#345d6b", 0.022, "fur");
  }
  const nose = ball(head, [0.12, 0.075, 0.085], [0, -0.20, 0.745], ink, "ceramic"); nose.rotation.z = -0.06;
  ball(head, [0.035, 0.013, 0.008], [-0.035, -0.172, 0.824], "#b6d1cd", "ceramic");
  ball(head, [0.155, 0.11, 0.025], [0.02, -0.41, 0.672], "#483e43", "fur");
  ball(head, [0.079, 0.038, 0.012], [0.025, -0.464, 0.695], "#ed8f9d", "fur");
  stroke(head, [[0, -0.26, 0.755], [-0.01, -0.35, 0.735], [-0.15, -0.37, 0.71], [-0.24, -0.33, 0.689]], ink, 0.017);
  stroke(head, [[-0.01, -0.35, 0.735], [0.12, -0.39, 0.724], [0.26, -0.33, 0.68]], ink, 0.017);
  for (const side of [-1, 1]) for (const rise of [-0.15, 0, 0.16]) stroke(head,
    [[side * 0.45, -0.25, 0.64], [side * 0.69, -0.25 + rise * 0.5, 0.64], [side * 0.91, -0.27 + rise, 0.51]], "#3c5357", 0.011);
  for (const side of [-1, 1]) for (let i = 0; i < 2; i++) stroke(head,
    [[side * 0.68, 0.30 - i * 0.15, 0.48], [side * 0.79, 0.26 - i * 0.15, 0.41]], "#396d80", 0.031, "fur");
  stroke(head, [[-0.07, 0.31, 0.625], [-0.085, 0.22, 0.648]], "#a4c0c4", 0.018, "fur");

  const laptop = group(root, [-0.18, 1.60, 1.05]); laptop.name = "creator-laptop";
  box(laptop, [1.63, 0.075, 0.95], [0, 0, 0], "#c9c6b8", 0.045, "metal");
  // Keys sit next to the forward hinge; the trackpad is nearest the seated cat.
  box(laptop, [1.44, 0.012, 0.42], [0, 0.045, 0.15], "#6a7675", 0.035, "plastic");
  for (let row = 0; row < 3; row++) for (let col = 0; col < 9; col++) box(laptop, [0.115, 0.018, 0.083], [-0.62 + col * 0.15, 0.056, 0.02 + row * 0.12], "#e8e6d7", 0.016, "plastic");
  box(laptop, [0.42, 0.006, 0.19], [0, 0.043, -0.25], "#aaa99c", 0.023, "metal");
  const lid = group(laptop, [0, 0.05, 0.44]); lid.rotation.x = 0.23;
  box(lid, [1.64, 1.13, 0.085], [0, 0.55, 0], "#e3d6c1", 0.065, "metal");
  box(lid, [1.49, 0.99, 0.012], [0, 0.55, -0.05], "#263d44", 0.035, "plastic");
  const display = box(lid, [1.38, 0.85, 0.008], [0, 0.56, -0.06], "#33575e", 0.02, "glow");
  for (let i = 0; i < 5; i++) box(display, [0.46 + i % 3 * 0.16, 0.024, 0.006], [0.14, 0.25 - i * 0.12, -0.009], ["#92dcc2", "#eed69a", "#e8a4b7"][i % 3], 0.004, "glow");
  emblem(lid, [0, 0.61, 0.053], 0.63);
  const hinge = cylinder(laptop, 0.049, 1.28, [0, 0.05, 0.43], "#8e9994", "metal"); hinge.rotation.z = Math.PI / 2;
  for (const x of [-0.77, 0.77]) for (let i = 0; i < 3; i++) box(laptop, [0.008, 0.025, 0.052], [x, 0, -0.12 + i * 0.09], ink, 0.004, "ink");
  const screenLight = new THREE.PointLight("#b7dfce", 0.24, 1.8, 2); screenLight.position.set(0, 0.7, -0.22); laptop.add(screenLight);

  // Small sleeping companion rests in the right seat, with a complete curled body.
  const kitten = group(root, [1.08, 1.23, 0.78]); kitten.name = "sleeping-black-cat"; kitten.rotation.y = -0.12;
  sculpt(kitten, [0.46, 0.19, 0.34], [0, 0.02, -0.03], "#303c3d", 2.5);
  const smallHead = group(kitten, [0.02, 0.18, 0.19]); smallHead.rotation.z = 0.13;
  sculpt(smallHead, [0.31, 0.27, 0.26], [0, 0, 0], "#303c3d", 2.2);
  ear(smallHead, -1, [-0.19, 0.14, -0.03], 0.36, "#303c3d"); ear(smallHead, 1, [0.19, 0.14, -0.03], 0.36, "#303c3d");
  for (const side of [-1, 1]) stroke(smallHead, [[side * 0.17 - 0.055, 0.03, 0.233], [side * 0.17 - 0.025, -0.035, 0.26], [side * 0.17 + 0.04, -0.036, 0.25], [side * 0.17 + 0.063, 0.005, 0.225]], "#f4cf59", 0.015);
  ball(smallHead, [0.035, 0.024, 0.018], [0, -0.082, 0.268], "#d48f9e", "fur");
  stroke(smallHead, [[0, -0.10, 0.264], [0.02, -0.13, 0.255]], "#b6aba3", 0.009);
  limb(kitten, [[-0.28, 0, -0.01], [-0.40, 0.09, 0.22], [-0.24, 0.10, 0.37], [-0.06, 0.08, 0.32]], [0.08, 0.08, 0.07, 0.025], "#435154");

  const { hotspots, staticGroup } = createCreatorProps(root, kit);
  // Merge stationary surfaces only within semantic groups. Never merge the cat,
  // its animated eyelids, or one category into another category.
  const batch = (target: THREE.Group) => { for (const geometry of batchStaticGroup(target)) retired.add(geometry); };
  for (const target of [fixed, backdropGroup, laptop, staticGroup, kitten, ...hotspots.map(h => h.group)]) batch(target);
  // Static facial details and limbs may batch inside their character, while
  // the eyes, torso and tail keep the independent transforms used by animation.
  for (const eye of eyes) eye.removeFromParent();
  batch(head);
  head.add(...eyes);
  for (const part of [head, torso, tail]) part.removeFromParent();
  batch(cat);
  cat.add(head, torso, tail);
  root.userData.retiredGeometries = retired;
  let lastTime = -1;
  return { root, hotspots, animate(time: number) {
    if (time === lastTime) return false;
    lastTime = time;
    // Torso breathing has a fixed seat contact; limbs/laptop remain supported.
    torso.scale.y = 1 + Math.sin(time * 1.35) * 0.006;
    torso.scale.z = 1 + Math.sin(time * 1.35) * 0.008;
    kitten.scale.y = 1 + Math.sin(time * 1.2 + 1) * 0.012;
    tail.rotation.y = Math.sin(time * 0.65) * 0.018;
    const phase = time % 6.4;
    const blink = phase > 5.7 && phase < 5.96 ? Math.sin((phase - 5.7) / 0.26 * Math.PI) : 0;
    for (const eye of eyes) eye.scale.y = 1 - blink * 0.93;
    return true;
  } };
}
