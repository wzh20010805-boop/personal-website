import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = (process.env.CHECK_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const basePath = new URL(baseURL).pathname.replace(/\/$/, "");
const output = `output/interactive-showcase/check-${new URL(baseURL).hostname}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
const errors = [];
const layouts = [];
const inspect = page => page.evaluate(() => window.showcase.inspect());
const seek = (page, time) => page.locator("#seek").evaluate((input, value) => {
  input.value = String(value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}, time);

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  // Companion behavior has its own checks; keep the learning cards unobstructed.
  await context.addInitScript(() => sessionStorage.setItem("creator-space:live2d:v1", JSON.stringify({ dismissed: true })));
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", request => {
    // Navigating away cancels pending audio transfers and Next prefetches normally.
    if (request.failure()?.errorText !== "net::ERR_ABORTED") errors.push(`${request.failure()?.errorText} ${request.url()}`);
  });

  await page.goto(`${baseURL}/learning/`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(`a.project-card[href="${basePath}/learning/virtual-character-video/"]`).count(), 1, "The existing video article remains available");
  const card = page.locator(`a.project-card[href="${basePath}/live2d-showcase/index.html"]`);
  assert.equal(await card.count(), 1);
  await Promise.all([
    page.waitForEvent("response", response => response.request().isNavigationRequest() && response.url() === `${baseURL}/live2d-showcase/index.html`),
    card.click(),
  ]);
  await page.waitForURL(`${baseURL}/live2d-showcase/index.html`);
  await page.waitForFunction(() => window.showcase);
  await page.evaluate(() => window.showcase.ready);
  const initial = await inspect(page);
  assert.equal(initial.parameterCount, 48);
  assert.equal(initial.playback.mode, "paused");
  assert.equal(initial.audio.paused, true, "Opening the page does not autoplay sound");
  assert.equal(await page.locator("[data-action]").count(), 8);
  assert.equal(await page.locator("[data-expression]").count(), 19);
  assert.ok(await page.locator("#play").isEnabled());

  // Seek into the second half before playback: this also exercises audio seeking.
  await seek(page, 29);
  assert.ok(Math.abs((await inspect(page)).playback.playhead - 29) < .04);
  await page.locator("#play").click();
  await page.waitForFunction(() => {
    const state = window.showcase.inspect();
    return state.playback.mode === "playing" && !state.audio.paused && state.audio.time > 29.2;
  });
  await page.getByRole("button", { name: "暂停展示", exact: true }).click();
  assert.equal((await inspect(page)).playback.mode, "paused");
  assert.equal((await inspect(page)).audio.paused, true);
  await page.locator("#play").click();
  await page.waitForFunction(() => !window.showcase.inspect().audio.paused);
  await page.getByRole("button", { name: "挥手", exact: true }).click();
  await page.waitForFunction(() => window.showcase.inspect().sample.motion === "挥手");
  const takeover = await inspect(page);
  assert.equal(takeover.playback.mode, "interactive");
  assert.equal(takeover.audio.paused, true);

  await page.getByRole("button", { name: "流泪", exact: true }).click();
  await page.waitForFunction(() => window.showcase.inspect().parameters.ParamTears > .9);
  await page.getByRole("button", { name: "生气", exact: true }).click();
  await page.waitForFunction(() => window.showcase.inspect().parameters.ParamTears < .01);
  await page.getByRole("button", { name: "女仆装", exact: true }).click();
  await page.locator("#iris-r").selectOption("1");
  await page.locator("#iris-l").selectOption("0");
  await page.getByRole("button", { name: "面部特写", exact: true }).click();
  await page.waitForFunction(() => {
    const state = window.showcase.inspect();
    return state.sample.expression === "angry" && state.sample.view === "face"
      && state.parameters.ParamOutfit === 0 && state.parameters.ParamIrisColorR === 1
      && state.parameters.ParamIrisColorL === 0;
  });
  assert.equal((await inspect(page)).playback.playhead, takeover.playback.playhead, "Interaction preserves the paused programme position");
  await page.getByRole("button", { name: "继续展示", exact: true }).click();
  await page.waitForFunction(start => {
    const state = window.showcase.inspect();
    return state.playback.mode === "playing" && !state.audio.paused
      && state.playback.playhead > start + .2 && state.sample.motionKey?.startsWith("programme:");
  }, takeover.playback.playhead);
  assert.ok((await inspect(page)).playback.playhead < takeover.playback.playhead + 5, "Resume continues from the prior position");
  await page.getByRole("button", { name: "暂停展示", exact: true }).click();
  await seek(page, 55);
  const seeked = await inspect(page);
  assert.equal(seeked.mode, "timeline");
  assert.equal(seeked.playback.mode, "paused");
  assert.equal(seeked.audio.paused, true);
  assert.ok(Math.abs(seeked.audio.time - 55) < .04);

  for (const width of [1440, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const mode of ["programme", "interactive"]) {
      if (mode === "programme") await seek(page, 0);
      else {
        await page.getByRole("button", { name: "冬装", exact: true }).click();
        await page.getByRole("button", { name: "开心", exact: true }).click();
        await page.getByRole("button", { name: "全身", exact: true }).click();
        await page.waitForFunction(() => window.showcase.inspect().parameters.ParamOutfit === 1 && window.showcase.inspect().sample.expression === "happy");
        const transitionStart = (await inspect(page)).liveTime;
        await page.waitForFunction(start => window.showcase.inspect().liveTime >= start + .6, transitionStart);
      }
      const layout = await page.evaluate(() => {
        const viewport = document.querySelector("#viewport").getBoundingClientRect();
        const canvas = document.querySelector("#actor");
        const sample = document.createElement("canvas");
        sample.width = 192; sample.height = 108;
        const context = sample.getContext("2d");
        context.drawImage(canvas, 0, 0, 192, 108);
        const pixels = context.getImageData(0, 0, 192, 108).data;
        return {
          width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          viewportFits: viewport.left >= 0 && viewport.right <= innerWidth + 1,
          renderedPixels: pixels.filter((value, index) => index % 4 === 3 && value > 20).length,
        };
      });
      assert.ok(layout.scrollWidth <= width, `No horizontal overflow at ${width}px in ${mode} mode`);
      assert.ok(layout.viewportFits && layout.renderedPixels > 100, "The real model is rendered in the viewport");
      layouts.push({ mode, ...layout });
      await page.evaluate(() => { scrollTo(0, 0); document.body.scrollTop = 0; document.documentElement.scrollTop = 0; });
      await page.screenshot({ path: `${output}/${mode}-${width}.png` });
    }
  }
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => window.showcase);
  await page.evaluate(() => window.showcase.ready);
  assert.equal((await inspect(page)).playback.mode, "paused");
  const back = page.locator('a[href="../learning/"]');
  assert.equal(await back.count(), 1);
  await back.click();
  await page.waitForURL(`${baseURL}/learning/`);
  await page.waitForLoadState("networkidle");
  assert.equal(await page.locator(`a.project-card[href="${basePath}/live2d-showcase/index.html"]`).count(), 1);
  assert.deepEqual(errors, []);
  await writeFile(`${output}/verification.json`, JSON.stringify({ baseURL, parameterCount: initial.parameterCount, layouts, errors, checks: ["learning card and full document navigation", "48-parameter model loads", "play, pause, audio seek and resume", "interaction takeover and expression cleanup", "outfit, iris and camera controls", "desktop and mobile layouts", "refresh and return navigation"] }, null, 2));
  console.log(`PASS ${baseURL}: standalone navigation, model, audio, interaction, three responsive widths, refresh and return; no browser or resource errors`);
} finally {
  await browser.close();
}
