import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.CHECK_URL ?? "http://127.0.0.1:3010";
const output = "output/six-view-checks";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge", args: ["--enable-unsafe-swiftshader"] });
const views = [["front", "正面 / FRONT"], ["left", "左侧 / LEFT"], ["right", "右侧 / RIGHT"], ["back", "背面 / BACK"], ["top", "顶部 / TOP"], ["bottom", "底部 / BOTTOM"]];
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1150 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await page.addInitScript(() => sessionStorage.setItem("creator-space:live2d:v1", JSON.stringify({ dismissed: true })));
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("[data-creator-scene]")?.dataset.sceneState === "ready");
  const figure = page.locator("[data-creator-scene]");
  const canvas = figure.locator("canvas");
  // Capture actual rendered pixels; no camera-specific object rearrangement.
  const pixelHash = () => canvas.evaluate(source => {
    const copy = document.createElement("canvas"); copy.width = source.width; copy.height = source.height;
    const context = copy.getContext("2d"); context.drawImage(source, 0, 0);
    const pixels = context.getImageData(0, 0, copy.width, copy.height).data;
    let hash = 0, count = 0;
    for (let i = 0; i < pixels.length; i += 16) { hash = Math.imul(hash, 31) + pixels[i] + pixels[i + 1] * 3 + pixels[i + 2] * 7 | 0; if (pixels[i + 3]) count++; }
    return { hash, count };
  });
  await figure.screenshot({ path: `${output}/default.png` });
  await figure.locator("summary").click();
  const results = [];
  for (const [id, label] of views) {
    await figure.locator(`[data-view-button="${id}"]`).click();
    await page.waitForFunction(id => document.querySelector("[data-creator-scene] canvas")?.dataset.view === id, id);
    await page.waitForTimeout(120);
    const signature = await canvas.getAttribute("data-model-signature");
    const camera = JSON.parse(await canvas.getAttribute("data-camera"));
    const pixels = await pixelHash();
    assert.ok(pixels.count > 5000, `${id} must contain rendered geometry`);
    assert.equal(await figure.locator('a[data-scene-category]:visible').count(), 0, "Projected labels must not obscure inspection views");
    assert.equal(await figure.getByRole("navigation", { name: "创作角功能入口" }).locator("a").count(), 6);
    await canvas.screenshot({ path: `${output}/${id}.png` });
    results.push({ id, label, signature, camera, ...pixels });
  }
  assert.equal(new Set(results.map(result => result.signature)).size, 1, "All six views must use the same geometry and model world transforms");
  assert.equal(new Set(results.map(result => result.hash)).size, 6, "Each orthographic direction must render a distinct view");
  const byId = Object.fromEntries(results.map(result => [result.id, result]));
  assert.deepEqual(byId.front.camera, [0, 2.5, 15.1]);
  assert.deepEqual(byId.back.camera, [0, 2.5, -14.9]);
  assert.deepEqual(byId.left.camera, [-15, 2.5, 0.1]);
  assert.deepEqual(byId.right.camera, [15, 2.5, 0.1]);
  assert.deepEqual(byId.top.camera, [0, 15.1, 0.1]);
  assert.deepEqual(byId.bottom.camera, [0, -14.9, 0.1]);
  await figure.locator('[data-view-button="back"]').click();
  await figure.getByLabel("显示粉色背板", { exact: true }).uncheck();
  await page.waitForTimeout(120);
  assert.notEqual((await pixelHash()).hash, byId.back.hash, "Only explicit backdrop toggle reveals the hidden rear construction");
  assert.equal(await canvas.getAttribute("data-model-signature"), byId.back.signature);
  await canvas.screenshot({ path: `${output}/back-uncovered.png` });
  await figure.getByLabel("显示粉色背板", { exact: true }).check();
  await figure.getByRole("button", { name: "重置视角", exact: true }).click();
  await page.waitForTimeout(120);
  assert.equal(await figure.getAttribute("data-scene-view"), "free");
  assert.equal(await figure.locator('a[data-scene-category]:visible').count(), 6);
  await figure.locator('[data-view-button="top"]').click();
  await canvas.press("ArrowLeft");
  await page.waitForTimeout(150);
  assert.equal(await figure.getAttribute("data-scene-view"), "free", "Keyboard orbit must leave exact inspection mode");
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify({ checkedAt: new Date().toISOString(), baseURL, views: results, errors }, null, 2));

  // A contact sheet of the six actual canvas screenshots, not a rendered reference image.
  const images = await Promise.all(views.map(async ([id, label]) => ({ id, label, src: `data:image/png;base64,${(await readFile(`${output}/${id}.png`)).toString("base64")}` })));
  const sheet = await browser.newPage({ viewport: { width: 1560, height: 1170 }, deviceScaleFactor: 1 });
  await sheet.setContent(`<html lang="zh-CN"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:22px;background:#fbf2df;color:#354038;font:14px system-ui,sans-serif}header{height:58px;padding-left:8px}h1{font-size:23px;margin:0 0 5px}p{margin:0;opacity:.75}main{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}figure{margin:0;border-radius:18px;background:#fff8e9;overflow:hidden}img{display:block;width:100%;aspect-ratio:1;object-fit:contain}figcaption{text-align:center;font-weight:800;font-size:16px;padding:9px 0 12px}</style><header><h1>创作角 · 真实模型六视图</h1><p>同一几何体、相同正交比例；背板不随视角移动，遮挡关系由三维空间决定。</p></header><main>${images.map(image => `<figure><img src="${image.src}" alt="${image.label}"><figcaption>${image.label}</figcaption></figure>`).join("")}</main></html>`);
  await sheet.locator("img").evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await sheet.screenshot({ path: `${output}/six-views.png`, fullPage: true });
  await sheet.close();
  console.log("PASS: six orthographic camera axes, invariant geometry/transforms, actual backdrop occlusion, independent rear inspection, six accessible routes and orbit/reset recovery");
} finally {
  await browser.close();
}
