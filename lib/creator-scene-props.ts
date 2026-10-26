import * as THREE from "three";
import type { CategoryId } from "@/data/categories";
import type { Point, SculptKit } from "./creator-scene-kit";

const ink = "#283a3e";
const cream = "#fff4d8";
const pink = "#f34387";
const green = "#36b96c";
const yellow = "#f7cf42";
const cyan = "#27b9d7";
const purple = "#973fda";

/** One spatial arrangement for every camera: front faces never follow the viewer. */
export function createCreatorProps(root: THREE.Group, kit: SculptKit) {
  const { group, mesh, box, ball, stroke, relief, lettering, cylinder, star, emblem } = kit;
  const hotspots: { id: CategoryId; group: THREE.Group; anchor: THREE.Vector3 }[] = [];
  function category(id: CategoryId, at: Point, anchor: Point, tilt = 0, yaw = 0) {
    const object = group(root, at, yaw);
    object.rotation.z = tilt;
    object.name = `category-${id}`;
    object.userData.category = id;
    hotspots.push({ id, group: object, anchor: new THREE.Vector3(...anchor) });
    return object;
  }
  function screw(parent: THREE.Object3D, at: Point, radius = 0.027) {
    ball(parent, [radius, radius, 0.012], at, "#c9d1ce", "metal");
    stroke(parent, [[at[0] - radius * 0.5, at[1], at[2] + 0.014], [at[0] + radius * 0.5, at[1], at[2] + 0.014]], "#657773", 0.004);
  }
  function reverse(parent: THREE.Object3D, at: Point) {
    // Reuse front-facing detail builders on a genuine back surface, never a
    // camera-facing copy. Coordinates below remain local to this rotated group.
    return group(parent, at, Math.PI);
  }

  // A thick enamel speech bubble, with raised code glyphs and a recessed rim.
  const prompts = category("prompts", [-2.38, 3.91, 0.08], [-2.38, 4.61, 0.1], 0.13, -0.1);
  const bubble = new THREE.Shape();
  bubble.moveTo(-0.64, 0.42);
  bubble.quadraticCurveTo(-0.78, 0.42, -0.78, 0.27);
  bubble.lineTo(-0.78, -0.24); bubble.quadraticCurveTo(-0.78, -0.39, -0.62, -0.39);
  bubble.lineTo(-0.44, -0.39); bubble.lineTo(-0.48, -0.65); bubble.quadraticCurveTo(-0.40, -0.67, -0.12, -0.39);
  bubble.lineTo(0.63, -0.39); bubble.quadraticCurveTo(0.78, -0.39, 0.78, -0.24);
  bubble.lineTo(0.78, 0.27); bubble.quadraticCurveTo(0.78, 0.42, 0.63, 0.42); bubble.closePath();
  relief(prompts, bubble, [0, 0, 0], "#a92361", 0.24, 0.055, "plastic", true);
  const face = relief(prompts, bubble, [0, 0, 0.13], pink, 0.055, 0.045);
  face.scale.set(0.965, 0.965, 1);
  for (const x of [-0.57, -0.45, -0.33]) ball(prompts, [0.026, 0.026, 0.012], [x, 0.25, 0.225], cream, "ceramic");
  stroke(prompts, [[-0.25, 0.18, 0.23], [-0.41, 0.02, 0.23], [-0.25, -0.14, 0.23]], cream, 0.032);
  stroke(prompts, [[0.25, 0.18, 0.23], [0.41, 0.02, 0.23], [0.25, -0.14, 0.23]], cream, 0.032);
  stroke(prompts, [[0.09, 0.22, 0.23], [-0.09, -0.19, 0.23]], ink, 0.028);
  stroke(prompts, [[-0.53, -0.27, 0.225], [-0.19, -0.27, 0.225]], "#ffbad3", 0.014);
  stroke(prompts, [[0.11, -0.27, 0.225], [0.51, -0.27, 0.225]], "#ffbad3", 0.014);
  const bubbleBack = reverse(prompts, [0, 0, -0.126]);
  // The blank reverse retains the same asymmetric tail in world coordinates.
  // A mirrored-code decal on this side would contradict a single physical sign.
  for (const x of [-0.59, 0.59]) screw(bubbleBack, [x, 0.21, 0.008], 0.020);

  // Two real shells, a rubber grip, latches, hinges and a small steel spanner.
  const tools = category("tools", [-0.56, 4.80, -0.47], [-0.56, 5.88, -0.25], -0.075, 0.14);
  box(tools, [1.28, 0.66, 0.65], [0, -0.04, 0], "#238b54", 0.11, "plastic", true);
  box(tools, [1.30, 0.23, 0.69], [0, 0.29, 0], green, 0.085);
  box(tools, [1.19, 0.045, 0.67], [0, 0.16, 0.006], "#185c41", 0.015);
  stroke(tools, [[-0.28, 0.4, 0], [-0.27, 0.62, 0], [-0.17, 0.68, 0], [0.18, 0.68, 0], [0.28, 0.61, 0], [0.29, 0.40, 0]], ink, 0.05);
  box(tools, [0.36, 0.095, 0.115], [0, 0.66, 0], "#244a3a", 0.04);
  for (const x of [-0.40, 0.40]) {
    box(tools, [0.16, 0.25, 0.075], [x, 0.14, 0.365], "#dbdfc6", 0.025, "metal");
    box(tools, [0.09, 0.10, 0.025], [x, 0.11, 0.411], "#9aa88c", 0.015, "metal");
    screw(tools, [x, 0.22, 0.412], 0.019);
    box(tools, [0.20, 0.11, 0.08], [x, 0.17, -0.35], "#a5bca6", 0.02, "metal");
    const hinge = cylinder(tools, 0.038, 0.22, [x, 0.175, -0.395], "#becbbd", "metal");
    hinge.rotation.z = Math.PI / 2;
  }
  for (const side of [-1, 1]) {
    const sideGrip = box(tools, [0.042, 0.15, 0.29], [side * 0.647, -0.03, 0], "#28734b", 0.02);
    sideGrip.name = "toolbox-side-recess";
  }
  for (const x of [-0.52, 0.52]) box(tools, [0.12, 0.14, 0.52], [x, -0.33, 0], "#1c5e42", 0.03);
  // The wrench sits in a rear holder rather than piercing the closed lid.
  box(tools, [0.19, 0.20, 0.13], [0.50, 0.17, -0.37], "#23794d", 0.035);
  const wrench = group(tools, [0.50, 0.44, -0.45]); wrench.rotation.z = -0.45;
  box(wrench, [0.085, 0.52, 0.065], [0, 0, 0], "#c4d3c7", 0.035, "metal");
  stroke(wrench, [[-0.12, 0.40, 0], [-0.13, 0.28, 0], [0, 0.22, 0], [0.13, 0.28, 0], [0.12, 0.40, 0]], "#d9e1d3", 0.045, "metal");

  // The controller has rounded grip volumes behind its front moulding.
  const games = category("games", [2.15, 4.62, -0.30], [2.18, 5.35, -0.15], -0.13, -0.16);
  const pad = new THREE.Shape();
  pad.moveTo(-0.72, -0.43); pad.bezierCurveTo(-0.99, -0.56, -0.91, -0.12, -0.77, 0.20);
  pad.bezierCurveTo(-0.66, 0.43, -0.50, 0.46, -0.31, 0.38);
  pad.quadraticCurveTo(0, 0.30, 0.31, 0.38); pad.bezierCurveTo(0.50, 0.46, 0.66, 0.43, 0.77, 0.20);
  pad.bezierCurveTo(0.91, -0.12, 0.99, -0.56, 0.72, -0.43);
  pad.lineTo(0.35, -0.19); pad.quadraticCurveTo(0, -0.10, -0.35, -0.19); pad.closePath();
  relief(games, pad, [0, 0, 0], "#553b87", 0.29, 0.09, "plastic", true);
  relief(games, pad, [0, 0, 0.13], purple, 0.09, 0.075);
  for (const side of [-1, 1]) {
    const grip = ball(games, [0.24, 0.38, 0.22], [side * 0.62, -0.17, -0.055], "#65468f"); grip.rotation.z = side * 0.28;
    box(games, [0.29, 0.095, 0.18], [side * 0.49, 0.40, -0.04], ink, 0.04);
    screw(games, [side * 0.66, -0.24, 0.265], 0.018);
  }
  box(games, [0.36, 0.105, 0.065], [-0.46, 0.12, 0.29], cream, 0.018);
  box(games, [0.105, 0.36, 0.07], [-0.46, 0.12, 0.295], cream, 0.018);
  for (const [x, y, color] of [[0.45, 0.26, yellow], [0.63, 0.09, pink], [0.28, 0.09, cyan], [0.45, -0.08, green]] as const) {
    ball(games, [0.072, 0.072, 0.026], [x, y, 0.282], ink);
    ball(games, [0.053, 0.053, 0.032], [x, y, 0.303], color);
  }
  for (const x of [-0.21, 0.17]) {
    ball(games, [0.092, 0.092, 0.045], [x, -0.09, 0.28], "#443452");
    ball(games, [0.066, 0.066, 0.04], [x, -0.09, 0.32], "#b794d4");
  }
  box(games, [0.15, 0.035, 0.018], [0, 0.22, 0.30], "#ccdfbe", 0.012, "glow");
  const padBack = reverse(games, [0, 0, -0.19]);
  box(padBack, [0.65, 0.36, 0.022], [0, 0.05, 0], "#493570", 0.06);
  box(padBack, [0.56, 0.27, 0.018], [0, 0.05, 0.016], "#65468f", 0.045);
  box(padBack, [0.11, 0.021, 0.014], [0, -0.07, 0.029], "#31283e", 0.005);
  for (const side of [-1, 1]) {
    screw(padBack, [side * 0.48, 0.18, 0.014], 0.023);
    screw(padBack, [side * 0.65, -0.25, 0.075], 0.020);
    for (let i = 0; i < 3; i++) stroke(padBack, [[side * 0.58, -0.11 - i * 0.06, 0.084], [side * 0.71, -0.16 - i * 0.06, 0.068]], "#4d376f", 0.009);
  }
  box(games, [0.15, 0.033, 0.045], [0, 0.344, -0.015], ink, 0.009);

  const skills = category("skills", [-2.57, 2.26, 0.10], [-2.55, 1.49, 0.32], -0.13, 0.08);
  box(skills, [1.02, 1.30, 0.14], [0, 0, 0], "#b99024", 0.07, "plastic", true);
  box(skills, [0.98, 1.26, 0.05], [0, 0, 0.09], yellow, 0.05);
  box(skills, [0.79, 1.04, 0.026], [0.01, -0.025, 0.132], "#fff5ce", 0.015, "paper");
  box(skills, [0.41, 0.14, 0.07], [0, 0.51, 0.16], "#b5aa6f", 0.035, "metal");
  box(skills, [0.25, 0.07, 0.024], [0, 0.57, 0.19], "#e2d8a9", 0.02, "metal");
  const clipboardBack = reverse(skills, [0, 0, -0.074]);
  box(clipboardBack, [0.82, 1.08, 0.012], [0, 0, 0], "#d7af42", 0.045, "plastic");
  for (const x of [-0.13, 0.13]) screw(clipboardBack, [x, 0.49, 0.016], 0.019);
  // The spring clip wraps over the top, connecting its visible front and back.
  box(skills, [0.34, 0.045, 0.29], [0, 0.625, 0.055], "#b5aa6f", 0.015, "metal");
  for (let i = 0; i < 3; i++) {
    const y = 0.24 - i * 0.25;
    box(skills, [0.12, 0.12, 0.008], [-0.25, y, 0.15], "#d7dfa3", 0.008, "paper");
    stroke(skills, [[-0.29, y, 0.162], [-0.25, y - 0.035, 0.162], [-0.19, y + 0.045, 0.162]], "#46754b", 0.012);
    stroke(skills, [[-0.08, y + 0.02, 0.156], [0.26, y + 0.02, 0.156]], "#65735b", 0.012);
    stroke(skills, [[-0.08, y - 0.04, 0.156], [0.15, y - 0.04, 0.156]], "#afa983", 0.007);
  }
  const seal = group(skills, [0.37, -0.39, 0.15]); seal.rotation.z = -0.1;
  box(seal, [0.12, 0.37, 0.025], [-0.07, -0.15, 0], pink, 0.01, "fabric").rotation.z = -0.15;
  box(seal, [0.12, 0.37, 0.025], [0.07, -0.15, 0], pink, 0.01, "fabric").rotation.z = 0.15;
  ball(seal, [0.21, 0.21, 0.035], [0, 0, 0.03], "#fff6cd", "ceramic");
  star(seal, [0, 0, 0.08], 0.13, yellow);

  const agents = category("agents", [2.65, 2.92, 0.15], [2.66, 2.08, 0.35], 0.07, -0.12);
  box(agents, [1.02, 0.87, 0.63], [0, 0.10, 0], "#dc6136", 0.17, "plastic", true);
  box(agents, [1.01, 0.85, 0.18], [0, 0.10, 0.28], "#fa8a4e", 0.15);
  box(agents, [0.82, 0.58, 0.08], [0, 0.17, 0.385], "#504d41", 0.10);
  box(agents, [0.72, 0.47, 0.035], [0, 0.18, 0.435], "#d8edd1", 0.085, "glow");
  for (const x of [-0.19, 0.19]) box(agents, [0.051, 0.16, 0.018], [x, 0.20, 0.463], ink, 0.025);
  stroke(agents, [[-0.10, 0.13, 0.468], [0, 0.06, 0.472], [0.10, 0.13, 0.468]], ink, 0.017);
  for (let i = 0; i < 3; i++) box(agents, [0.10, 0.025, 0.018], [-0.25 + i * 0.11, -0.22, 0.391], "#7b4a33", 0.01);
  ball(agents, [0.044, 0.044, 0.018], [0.26, -0.22, 0.40], yellow, "glow");
  const aerial = cylinder(agents, 0.018, 0.25, [0.04, 0.66, -0.02], "#8c8b71", "metal"); aerial.rotation.z = -0.12;
  ball(agents, [0.075, 0.075, 0.075], [0.06, 0.81, -0.02], yellow, "ceramic");
  for (const side of [-1, 1]) {
    ball(agents, [0.075, 0.075, 0.075], [side * 0.56, -0.01, 0], "#8f6c4d", "metal");
    stroke(agents, [[side * 0.56, -0.01, 0], [side * 0.69, -0.13, 0.08], [side * 0.73, 0.04, 0.13]], "#7f7258", 0.035, "metal");
    ball(agents, [0.09, 0.10, 0.08], [side * 0.73, 0.06, 0.13], cream, "plastic");
    box(agents, [0.16, 0.19, 0.18], [side * 0.25, -0.40, 0], "#7b7359", 0.04, "metal");
    box(agents, [0.25, 0.10, 0.32], [side * 0.25, -0.52, 0.06], "#b65535", 0.045);
  }
  const robotBack = reverse(agents, [0, 0.10, -0.32]);
  box(robotBack, [0.69, 0.55, 0.026], [0, 0, 0], "#b65234", 0.08);
  box(robotBack, [0.59, 0.45, 0.016], [0, 0, 0.019], "#e77643", 0.055);
  for (let i = 0; i < 4; i++) box(robotBack, [0.35, 0.022, 0.013], [0, 0.12 - i * 0.07, 0.034], "#884632", 0.008);
  for (const side of [-1, 1]) screw(robotBack, [side * 0.24, -0.16, 0.035], 0.022);
  box(robotBack, [0.13, 0.055, 0.02], [0, -0.34, 0.012], "#6c4d3c", 0.012);

  const learning = category("learning", [2.78, 1.30, 0.40], [2.76, 0.53, 0.75], -0.17, -0.24);
  // Two separate covers surround an exposed page block. A full solid outer
  // box would incorrectly hide the pages from the top and side viewpoints.
  box(learning, [0.94, 1.20, 0.055], [0.015, 0, -0.16], "#12829f", 0.035, "plastic", true);
  box(learning, [0.84, 1.11, 0.26], [0.035, 0, 0], "#eee4c5", 0.016, "paper");
  for (const z of [-0.10, -0.06, -0.02, 0.02, 0.06, 0.10]) stroke(learning, [[0.457, -0.49, z], [0.457, 0.49, z]], "#b9bdad", 0.004);
  for (const z of [-0.06, 0, 0.06]) for (const y of [-0.556, 0.556]) stroke(learning, [[-0.32, y, z], [0.39, y, z]], "#c6c3a9", 0.004);
  box(learning, [0.94, 1.20, 0.055], [0.015, 0, 0.16], cyan, 0.035);
  box(learning, [0.10, 1.20, 0.37], [-0.42, 0, 0.015], "#1b8caa", 0.035);
  box(learning, [0.48, 0.30, 0.016], [0.07, 0.23, 0.199], "#e9f5dc", 0.022, "paper");
  lettering(learning, "NOTES", [0.38, 0.105], [0.07, 0.27, 0.21], "#327184");
  stroke(learning, [[-0.08, 0.16, 0.21], [0.22, 0.16, 0.21]], "#7ca8a6", 0.006);
  star(learning, [0.04, -0.20, 0.22], 0.145, "#87e2df");
  box(learning, [0.09, 1.24, 0.023], [0.30, 0, 0.20], "#13819a", 0.012, "fabric");
  box(learning, [0.12, 0.31, 0.018], [0.12, 0.47, 0.217], yellow, 0.006, "fabric");
  const notebookBack = reverse(learning, [0.015, 0, -0.194]);
  box(notebookBack, [0.09, 1.21, 0.018], [-0.285, 0, 0], "#13819a", 0.008, "fabric");
  for (const y of [-0.615, 0.615]) box(learning, [0.09, 0.02, 0.34], [0.30, y, 0.018], "#13819a", 0.008, "fabric");
  const spineType = lettering(learning, "NOTES", [0.56, 0.085], [-0.477, 0.02, 0.015], "#d3f5ee");
  spineType.rotation.set(0, -Math.PI / 2, Math.PI / 2);

  // Low foreground props provide believable contact and scale around the sofa.
  const staticGroup = group(root, [0, 0, 0]);
  staticGroup.name = "creator-desk-props";
  const books = group(staticGroup, [-2.02, 0.30, 1.65], -0.06);
  books.name = "fixed-left-book-stack";
  for (const [index, color, title] of [[0, green, "MY WORLD"], [1, pink, "CREATE"], [2, cyan, "IDEAS"]] as const) {
    const volume = group(books, [index === 1 ? -0.09 : 0, index * 0.27, 0], index === 1 ? -0.09 : 0.02);
    box(volume, [1.33, 0.20, 0.83], [0, 0, 0], "#eee2c0", 0.025, "paper");
    for (const y of [-0.12, 0.12]) box(volume, [1.44, 0.04, 0.91], [0, y, 0], color, 0.025);
    box(volume, [1.44, 0.24, 0.07], [0, 0, 0.44], color, 0.03);
    // One bound edge (front spine), three exposed paper edges, at every angle.
    for (const y of [-0.07, -0.025, 0.02, 0.065]) {
      for (const x of [-0.667, 0.667]) stroke(volume, [[x, y, -0.32], [x, y, 0.35]], "#c3b997", 0.004);
      stroke(volume, [[-0.60, y, -0.417], [0.60, y, -0.417]], "#c3b997", 0.004);
    }
    lettering(volume, title, [1.03, 0.17], [0, 0, 0.483], "#1a5353");
  }
  const mug = group(staticGroup, [-2.02, 0.98, 1.60], 0.03);
  mug.name = "fixed-left-mug";
  const mugProfile = [[0, 0], [0.19, 0], [0.235, 0.035], [0.26, 0.41], [0.25, 0.45], [0.215, 0.45], [0.207, 0.09], [0, 0.09]].map(([x, y]) => new THREE.Vector2(x, y));
  mesh(mug, new THREE.LatheGeometry(mugProfile, 40), "#fff5d6", [0, 0, 0], "ceramic");
  cylinder(mug, 0.211, 0.009, [0, 0.395, 0], "#573e30", "plastic");
  mesh(mug, new THREE.TorusGeometry(0.158, 0.043, 10, 32), "#fff5d6", [0.29, 0.25, 0], "ceramic");
  emblem(mug, [0, 0.235, 0.263], 0.36);

  const plant = group(staticGroup, [-2.75, 0.13, 0.39], 0.1);
  plant.name = "fixed-left-plant";
  mesh(plant, new THREE.CylinderGeometry(0.31, 0.25, 0.46, 40), "#f2ead7", [0, 0.25, 0], "ceramic");
  cylinder(plant, 0.31, 0.07, [0, 0.47, 0], "#fff5e4", "ceramic");
  cylinder(plant, 0.265, 0.018, [0, 0.48, 0], "#5c5140", "paper");
  for (let i = 0; i < 8; i++) {
    const angle = i * 2.399;
    const height = 0.62 + (i % 3) * 0.13;
    const reach = 0.32 + (i % 2) * 0.12;
    const end: Point = [Math.sin(angle) * reach, height + 0.48, Math.cos(angle) * reach];
    const middle: Point = [end[0] * 0.45, 0.62, end[2] * 0.45];
    stroke(plant, [[0, 0.46, 0], middle, end], "#3f7650", 0.018);
    const leaf = new THREE.Shape(); leaf.moveTo(0, 0);
    leaf.bezierCurveTo(-0.17, 0.11, -0.20, 0.40, 0, 0.59);
    leaf.bezierCurveTo(0.19, 0.37, 0.18, 0.11, 0, 0);
    const blade = relief(plant, leaf, [end[0] * 0.52, 0.59, end[2] * 0.52], i % 2 ? "#32a666" : "#1a8154", 0.027, 0.02, "fur");
    blade.rotation.set(-0.25 + Math.cos(angle) * 0.45, angle * 0.45, -Math.sin(angle) * 0.75);
    stroke(blade, [[0, 0.03, 0.031], [0.018, 0.26, 0.043], [0, 0.48, 0.03]], "#8ccb8a", 0.008);
  }

  const bag = group(staticGroup, [1.93, 0.75, 1.90], -0.23);
  bag.name = "fixed-right-backpack";
  box(bag, [0.93, 1.18, 0.62], [0, 0, 0], "#2b9859", 0.22, "fabric", true);
  box(bag, [0.83, 1.07, 0.11], [0, 0.01, 0.30], "#43b968", 0.20, "fabric");
  stroke(bag, [[-0.20, 0.55, -0.04], [-0.18, 0.77, -0.04], [0.18, 0.77, -0.04], [0.20, 0.55, -0.04]], "#236946", 0.045, "fabric");
  for (const side of [-1, 1]) {
    stroke(bag, [[side * 0.26, 0.45, -0.25], [side * 0.40, 0.13, -0.43], [side * 0.31, -0.43, -0.25]], "#245f43", 0.055, "fabric");
    stroke(bag, [[side * 0.33, -0.35, 0.37], [side * 0.37, 0.13, 0.34], [side * 0.25, 0.42, 0.34]], "#95d58a", 0.009);
    box(bag, [0.14, 0.55, 0.08], [side * 0.31, 0.04, -0.39], "#297b4b", 0.055, "fabric").rotation.z = side * -0.10;
    const buckle = box(bag, [0.16, 0.12, 0.04], [side * 0.31, -0.29, -0.375], "#d6c778", 0.018, "metal");
    box(buckle, [0.09, 0.05, 0.015], [0, 0, -0.027], "#245f43", 0.005);
  }
  box(bag, [0.55, 0.73, 0.055], [0, -0.015, -0.33], "#2c7b4e", 0.15, "fabric");
  stroke(bag, [[-0.37, -0.37, -0.25], [-0.42, 0.28, -0.24], [-0.24, 0.52, -0.24], [0.24, 0.52, -0.24], [0.42, 0.28, -0.24], [0.37, -0.37, -0.25]], "#66bb78", 0.012, "fabric");
  box(bag, [0.66, 0.52, 0.20], [0, -0.16, 0.38], "#289653", 0.105, "fabric");
  stroke(bag, [[-0.26, 0.04, 0.48], [0, 0.06, 0.49], [0.27, 0.04, 0.48]], "#d6cb7d", 0.013, "metal");
  box(bag, [0.04, 0.12, 0.025], [0.20, 0.0, 0.51], "#dbc965", 0.01, "metal");
  box(bag, [0.43, 0.38, 0.022], [0, 0.29, 0.371], cream, 0.03, "fabric");
  emblem(bag, [0, 0.30, 0.391], 0.34);
  star(bag, [-0.43, 0.39, 0.25], 0.14, yellow);

  box(staticGroup, [0.86, 0.29, 0.38], [0.28, 0.30, 2.37], "#d781a0", 0.035, "paper");
  const note = group(staticGroup, [0.28, 0.38, 2.63], -0.13); note.rotation.x = -Math.PI / 2 + 0.45;
  box(note, [1.23, 0.99, 0.07], [0, 0, 0], "#cbbb91", 0.025, "paper");
  box(note, [1.18, 0.95, 0.04], [0, 0, 0.05], cream, 0.012, "paper");
  for (let i = 0; i < 6; i++) {
    const ring = mesh(note, new THREE.TorusGeometry(0.061, 0.013, 6, 16, Math.PI * 1.7), "#64746d", [-0.57, -0.38 + i * 0.15, 0.065], "metal");
    ring.rotation.y = Math.PI / 2;
  }
  for (const [text, y] of [["Keep", 0.28], ["Creating!", 0.045], ["Keep Going!", -0.19]] as const) lettering(note, text, [0.91, 0.18], [0.04, y, 0.079], "#4c6555");
  stroke(note, [[-0.12, -0.34, 0.08], [0.36, -0.31, 0.08]], pink, 0.012);
  const pen = group(staticGroup, [-0.58, 0.21, 2.75], -0.20); pen.rotation.z = Math.PI / 2;
  cylinder(pen, 0.045, 0.91, [0, 0, 0], pink, "plastic");
  cylinder(pen, 0.050, 0.21, [0, 0.37, 0], "#e788ac", "plastic");
  mesh(pen, new THREE.ConeGeometry(0.044, 0.14, 16), "#c5c4ac", [0, -0.50, 0], "metal").rotation.z = Math.PI;
  box(pen, [0.019, 0.21, 0.025], [0.044, 0.34, 0.017], cream, 0.006, "metal");

  for (const [x, y, z, radius, color] of [
    [-3.15, 3.00, 0.10, 0.14, cyan], [-1.63, 5.07, -0.15, 0.16, yellow],
    [0.76, 5.33, -0.15, 0.13, pink], [3.12, 3.95, 0.0, 0.15, yellow],
    [-1.30, 0.25, 2.0, 0.13, yellow], [1.12, 0.23, 2.01, 0.11, cyan],
  ] as const) star(staticGroup, [x, y, z], radius, color).rotation.z = x * 0.08;
  return { hotspots, staticGroup };
}
