import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.CHECK_URL ?? "http://127.0.0.1:3010";
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge", args: ["--enable-unsafe-swiftshader"] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await page.addInitScript(() => sessionStorage.setItem("creator-space:live2d:v1", JSON.stringify({ dismissed: true })));
  const errors = [];
  const requests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => { if (new URL(request.url()).origin !== new URL(baseURL).origin) requests.push(request.url()); });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const scene = page.getByRole("figure", { name: "可交互的 3D 创作角", exact: true });
  assert.equal(await scene.count(), 1, "The hero illustration must become an interactive 3D scene");
  await page.waitForFunction(() => document.querySelector("[data-creator-scene]")?.getAttribute("data-scene-state") === "ready");
  const canvas = scene.locator("canvas");
  const ready = () => page.waitForFunction(() => document.querySelector("[data-creator-scene]")?.getAttribute("data-scene-state") === "ready");
  const reset = async () => {
    await scene.getByRole("button", { name: "重置视角", exact: true }).click();
    await page.waitForTimeout(180);
  };
  const ids = ["prompts", "tools", "games", "skills", "agents", "learning"];
  const labelsReachable = async () => {
    const labels = await scene.locator("a[data-scene-category]").evaluateAll((links) => links.map((link) => {
      const rect = link.getBoundingClientRect();
      const center = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return { id: link.dataset.sceneCategory, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, reachable: center === link || link.contains(center) };
    }));
    for (let i = 0; i < labels.length; i++) {
      const a = labels[i];
      assert.ok(a.reachable, `Scene label ${a.id} must not be covered by fixed UI`);
      for (let j = 0; j < i; j++) {
        const b = labels[j];
        assert.ok(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top, `Scene labels ${a.id} and ${b.id} must not overlap`);
      }
    }
  };
  const pixels = () => canvas.evaluate((source) => {
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;
    const context = copy.getContext("2d");
    context.drawImage(source, 0, 0);
    const data = context.getImageData(0, 0, copy.width, copy.height).data;
    let hash = 0;
    let visible = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 16) visible++;
      hash = (Math.imul(hash, 31) + data[i] + data[i + 1] * 3 + data[i + 2] * 7) | 0;
    }
    return { hash, visible };
  });
  const initial = await pixels();
  assert.ok(initial.visible > 10000, "Real scene geometry must render into the WebGL canvas");
  assert.equal(await scene.locator("a[data-scene-category]").count(), 6);
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.57, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  assert.notEqual((await pixels()).hash, initial.hash, "Dragging must rotate actual scene geometry");
  await scene.getByRole("button", { name: "重置视角", exact: true }).click();
  await page.waitForTimeout(120);
  assert.equal((await pixels()).hash, initial.hash, "Reset must restore the original camera");
  await scene.getByRole("button", { name: "放大场景", exact: true }).click();
  await page.waitForTimeout(100);
  assert.notEqual((await pixels()).hash, initial.hash, "Scene zoom must change the rendered view");
  await scene.getByRole("button", { name: "重置视角", exact: true }).click();
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  assert.notEqual((await pixels()).hash, initial.hash, "Keyboard controls must rotate the scene");
  await page.keyboard.press("Home");
  await page.waitForTimeout(120);
  await canvas.blur();
  for (const id of ids) {
    assert.equal(await scene.locator(`a[data-scene-category="${id}"]`).getAttribute("href"), `/${id}/`);
  }
  await mkdir("output/creator-scene-checks", { recursive: true });
  await mkdir("output/scene-refinement", { recursive: true });
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await scene.scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    assert.ok((await pixels()).visible > 5000);
    for (const link of await scene.locator("a[data-scene-category]").all()) {
      const bounds = await link.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, "Scene category labels must stay inside narrow screens");
    }
    await labelsReachable();
    await page.screenshot({ path: `output/creator-scene-checks/scene-${width}.png` });
    if (width === 1440) await scene.screenshot({ path: "output/creator-scene-checks/creator-corner-preview.png" });
    if (width === 375) {
      await scene.screenshot({ path: "output/scene-refinement/final-mobile.png" });
      await canvas.focus();
      for (let turn = 0; turn < 15; turn++) {
        await canvas.press("ArrowRight");
        await page.waitForTimeout(100);
        await labelsReachable();
      }
      await scene.getByRole("button", { name: "放大场景", exact: true }).click();
      await page.waitForTimeout(180);
      await labelsReachable();
      await scene.getByRole("button", { name: "重置视角", exact: true }).click();
      await page.waitForTimeout(120);
    }
  }
  // Keyboard focus must highlight the corresponding independent object, and
  // Enter must use the same activation path as a canvas click.
  await page.keyboard.press("Tab");
  for (const id of ids) {
    const label = scene.locator(`a[data-scene-category="${id}"]`);
    await label.focus();
    assert.equal(await label.getAttribute("data-active"), "true");
    assert.equal(await label.evaluate((element) => getComputedStyle(element).outlineStyle), "solid");
  }
  await scene.locator('a[data-scene-category="tools"]').focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/tools/");
  await page.goBack({ waitUntil: "networkidle" });
  await ready();
  assert.equal(await scene.locator("canvas").count(), 1, "Returning home must recreate exactly one scene");
  // Search close to the projected label using actual pointer/raycast events.
  // Unlike a fixed pixel/color guess this survives model refinements and label
  // avoidance, while still requiring the physical canvas object to own the hit.
  const meshPoint = async (id) => {
    await scene.scrollIntoViewIfNeeded();
    const point = await page.evaluate(async (category) => {
      const surface = document.querySelector("[data-creator-scene] canvas");
      const label = document.querySelector(`a[data-scene-category="${category}"]`);
      const bounds = surface.getBoundingClientRect();
      const tag = label.getBoundingClientRect();
      const sign = ["skills", "agents", "learning"].includes(category) ? -1 : 1;
      const candidates = [];
      for (const dy of [0.1, 0.07, 0.14, 0.18, 0.22, 0.04, -0.08]) {
        for (const dx of [0, -0.04, 0.04, -0.08, 0.08, -0.13, 0.13]) candidates.push({ x: tag.x + tag.width / 2 + bounds.width * dx, y: tag.y + tag.height / 2 + sign * bounds.width * dy });
      }
      for (const candidate of candidates) {
        if (document.elementFromPoint(candidate.x, candidate.y) !== surface) continue;
        surface.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, isPrimary: true, pointerType: "mouse", pointerId: 1, clientX: candidate.x, clientY: candidate.y }));
        await new Promise(requestAnimationFrame);
        if (label.dataset.active === "true") return candidate;
      }
      return null;
    }, id);
    assert.ok(point, `The physical ${id} entrance must have an independently hittable visible surface`);
    await page.mouse.move(point.x, point.y);
    await page.waitForFunction((category) => document.querySelector(`a[data-scene-category="${category}"]`)?.getAttribute("data-active") === "true", id);
    assert.equal(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, point), "CANVAS");
    return point;
  };
  let terminal = await meshPoint("prompts");
  assert.ok(terminal, "The pink physical terminal must be visible");
  await page.mouse.move(terminal.x, terminal.y);
  await page.mouse.down();
  await page.mouse.move(terminal.x + 100, terminal.y, { steps: 12 });
  await page.waitForTimeout(300);
  await page.mouse.move(terminal.x, terminal.y, { steps: 12 });
  await page.waitForTimeout(300);
  await page.mouse.up();
  await page.waitForTimeout(100);
  assert.equal(new URL(page.url()).pathname, "/", "A drag returning to its starting point must not navigate");
  await reset();
  for (const id of ids) {
    const target = await meshPoint(id);
    await page.mouse.click(target.x, target.y);
    await page.waitForURL(`**/${id}/`);
    await page.goBack({ waitUntil: "networkidle" });
    await ready();
  }
  // Two quick clicks must not stack activation animations or router pushes.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  terminal = await meshPoint("prompts");
  const activations = [];
  const trackNavigation = (frame) => { if (frame === page.mainFrame() && new URL(frame.url()).pathname === "/prompts/") activations.push(frame.url()); };
  page.on("framenavigated", trackNavigation);
  await page.mouse.dblclick(terminal.x, terminal.y, { delay: 20 });
  await page.waitForURL("**/prompts/");
  await page.waitForTimeout(200);
  page.off("framenavigated", trackNavigation);
  assert.equal(activations.length, 1, "Rapid double clicks must navigate only once");
  await page.goBack({ waitUntil: "networkidle" });
  await ready();
  await page.emulateMedia({ reducedMotion: "reduce" });

  // Actual rendered acceptance views: initial composition, three-quarter side,
  // a close view of the subject, and a physical entrance held in its pressed state.
  await reset();
  await scene.screenshot({ path: "output/scene-refinement/final-overall.png" });
  await canvas.focus();
  for (let i = 0; i < 4; i++) await canvas.press("ArrowLeft");
  await page.waitForTimeout(500);
  await canvas.blur();
  await labelsReachable();
  await scene.screenshot({ path: "output/scene-refinement/final-side.png" });
  await reset();
  for (let i = 0; i < 3; i++) await scene.getByRole("button", { name: "放大场景", exact: true }).click();
  await page.waitForTimeout(150);
  await labelsReachable();
  await scene.screenshot({ path: "output/scene-refinement/final-close.png" });
  await reset();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const activePoint = await meshPoint("tools");
  await page.mouse.down();
  await page.waitForTimeout(80);
  assert.equal(await scene.locator('a[data-scene-category="tools"]').getAttribute("data-active"), "true");
  await scene.screenshot({ path: "output/scene-refinement/final-active.png" });
  await page.mouse.up();
  await page.waitForURL("**/tools/");
  assert.ok(activePoint);
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  await page.close();
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    sessionStorage.setItem("creator-space:live2d:v1", JSON.stringify({ dismissed: true }));
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (kind === "webgl" || kind === "webgl2" || kind === "experimental-webgl") return null;
      return original.call(this, kind, ...args);
    };
  });
  await fallback.goto(baseURL, { waitUntil: "networkidle" });
  await fallback.waitForFunction(() => document.querySelector("[data-creator-scene]")?.getAttribute("data-scene-state") === "fallback");
  await fallback.locator("[data-creator-scene] img").waitFor({ state: "visible" });
  await fallback.locator('a[data-scene-category="agents"]').click();
  await fallback.waitForURL("**/agents/");
  await fallback.close();
  console.log("PASS: 3D pixels, pointer/keyboard orbit, exact zoom/reset, all six physical entrances, keyboard focus/activation, drag cancellation, rapid-click guard, four responsive widths, local assets, remount, WebGL fallback and five rendered acceptance views");
} finally {
  await browser.close();
}
