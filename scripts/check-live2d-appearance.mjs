import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { petExpressions } from "../data/live2d-appearance.ts";

const output = "output/pet-update-20261031/browser";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
const baseURL = process.env.CHECK_URL ?? "http://127.0.0.1:3010";
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  let settingsRequests = 0;
  page.on("pageerror", error => errors.push(error.message));
  page.on("requestfailed", request => console.error("Failed asset:", request.url(), request.failure()?.errorText));
  page.on("console", message => { if (message.type() === "error" || message.type() === "warning") console.error(message.text()); });
  await page.route("**/character.model3.json", async route => {
    settingsRequests++;
    await page.evaluate(() => {
      if (window.petTestModels) return;
      window.petTestModels = [];
      const prototype = window.PIXI.live2d.Live2DModel.prototype;
      const init = prototype.init;
      prototype.init = function (...args) {
        const result = init.apply(this, args);
        window.petTestModels.push(this);
        const core = this.internalModel.coreModel;
        const update = core.update;
        core.update = function (...args) {
          window.petRendered = Object.fromEntries(this._parameterIds.map(id => [id, this.getParameterValueById(id)]));
          window.petRenderedFrames = (window.petRenderedFrames ?? 0) + 1;
          return update.apply(this, args);
        };
        return result;
      };
    });
    await route.continue();
  });
  const ready = async () => {
    await page.waitForFunction(() => ["ready", "error"].includes(document.querySelector("[data-pet-status]")?.dataset.petStatus), null, { timeout: 45000 });
    assert.equal(await page.locator("[data-pet-status]").getAttribute("data-pet-status"), "ready", errors.join("\n"));
    await page.waitForFunction(() => window.petRendered, null, { timeout: 5000 });
  };
  const nextPose = async () => {
    await page.mouse.move(-10, -10);
    const frame = await page.evaluate(() => window.petRenderedFrames);
    await page.waitForFunction(previous => window.petRenderedFrames > previous + 2, frame);
    return page.evaluate(() => window.petRendered);
  };
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await ready();
  const pet = page.getByRole("region", { name: "Live2D 网页伙伴" });
  const canvas = await pet.locator("canvas").elementHandle();
  await pet.getByRole("button", { name: "陪你逛逛" }).click();
  const report = [];
  for (const outfit of ["maid", "winter"]) {
    await pet.getByRole("button", { name: "服饰", exact: true }).click();
    await pet.locator(`[data-outfit="${outfit}"]`).click();
    await pet.getByRole("button", { name: "表情", exact: true }).click();
    assert.equal(await pet.locator("[data-expression]").count(), 14);
    // Start with tears, so resetting to every later expression detects residue.
    for (const expression of [petExpressions.find(item => item.id === "cry"), ...petExpressions]) {
      await pet.locator(`[data-expression="${expression.id}"]`).click();
      const pose = await nextPose();
      assert.equal(pose.ParamOutfit, outfit === "winter" ? 1 : 0);
      const motionOwned = new Set(["ParamEyeLOpen", "ParamEyeROpen", "ParamEyeBallX", "ParamEyeBallY", "ParamEyeBallForm"]);
      for (const [id, value] of Object.entries(expression.values)) {
        if (motionOwned.has(id) || (expression.id === "neutral" && ["ParamMouthOpenY", "ParamMouthForm", "ParamBrowLY", "ParamBrowRY"].includes(id))) continue;
        assert.ok(Math.abs(pose[id] - value) < .001, `${outfit}/${expression.id}: ${id} expected ${value}, got ${pose[id]}`);
      }
      assert.ok(await canvas.evaluate(element => element.isConnected), "Appearance changes must retain the same renderer");
      await pet.locator("canvas").screenshot({ path: `${output}/${outfit}-${expression.id}.png` });
      report.push({ outfit, expression: expression.id, passed: true });
    }
  }
  assert.equal(settingsRequests, 1, "Changing expression/outfit must not reload model assets");
  await pet.getByRole("button", { name: "动作", exact: true }).click();
  for (const motion of ["Wave7", "HandsOnHips7", "GestureSequence18", "motion_18", "HeadTiltArmClearance", "motion_19"]) {
    await pet.locator(`[data-motion="${motion}"]`).click();
    await page.waitForFunction(expected => document.querySelector("[data-pet-motion]")?.dataset.petMotion === expected, motion);
    await page.waitForTimeout(450);
    const earlyPose = await nextPose();
    await page.waitForTimeout(450);
    const pose = await nextPose();
    assert.equal(await pet.getAttribute("data-pet-motion"), motion);
    assert.equal(pose.ParamOutfit, 1);
    assert.equal(pose.ParamQuestion, 1);
    const poseParameters = ["ParamAngleX", "ParamAngleY", "ParamAngleZ", "ParamBodyAngleX", "ParamBodyAngleY", "ParamBodyAngleZ", "ParamShoulderR", "ParamShoulderL", "ParamElbowR", "ParamElbowL"];
    assert.ok(poseParameters.some(id => Math.abs(pose[id] - earlyPose[id]) > .05), `${motion} must change the actual rendered pose`);
    await pet.locator("canvas").screenshot({ path: `${output}/winter-${motion}.png` });
  }
  await pet.getByRole("button", { name: "表情", exact: true }).click();
  await pet.locator('[data-expression="happy"]').click();
  await nextPose();
  await page.screenshot({ path: `${output}/winter-menu.png` });
  await pet.getByRole("button", { name: "收起互动菜单" }).click();
  await page.locator('a.category-card[href="/tools/"]').click();
  await page.locator('a.project-card[href="/tools/pixel-cursor/"]').click();
  await nextPose();
  assert.equal(settingsRequests, 1);
  assert.ok(await canvas.evaluate(element => element.isConnected));
  await page.reload({ waitUntil: "networkidle" });
  await ready();
  let pose = await nextPose();
  assert.equal(pose.ParamOutfit, 1);
  assert.equal(pose.ParamEyeLStyle, 1);
  await pet.getByRole("button", { name: "陪你逛逛" }).click();
  await pet.getByRole("button", { name: "退出互动", exact: true }).click();
  await page.getByRole("button", { name: "召回伙伴" }).click();
  await ready();
  pose = await nextPose();
  assert.equal(pose.ParamOutfit, 1);
  assert.equal(pose.ParamEyeLStyle, 1);
  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 740 });
    await pet.getByRole("button", { name: "陪你逛逛" }).click();
    for (const section of ["表情", "服饰", "动作"]) {
      await pet.getByRole("button", { name: section, exact: true }).click();
      const box = await pet.getByRole("group", { name: "伙伴互动菜单" }).boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width && box.y >= 0 && box.y + box.height <= 740);
    }
    await page.keyboard.press("Escape");
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/verification.json`, JSON.stringify({ report, settingsRequests, errors, checks: ["all expressions both outfits", "effect reset", "six updated gesture motions", "same renderer", "nested routes", "refresh", "recall", "mobile menu"] }, null, 2));
  console.log("PASS: all expressions in both outfits, actual rendered parameters, six updated gesture motions, persistence, mobile menu; zero runtime errors");
} finally {
  await browser.close();
}
