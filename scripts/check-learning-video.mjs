import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = (process.env.CHECK_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const basePath = new URL(baseURL).pathname.replace(/\/$/, "");
const output = `output/video-learning-20261031/check-${new URL(baseURL).hostname}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  // Keep the article unobstructed in layout captures; companion behavior is tested separately.
  await context.addInitScript(() => sessionStorage.setItem("creator-space:live2d:v1", JSON.stringify({ dismissed: true })));
  const page = await context.newPage();
  const errors = [];
  const videoRequests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on("request", request => { if (request.url().endsWith(".mp4")) videoRequests.push(request.url()); });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const learning = page.locator(`a.category-card[href="${basePath}/learning/"]`);
  assert.match(await learning.innerText(), /1 篇记录/);
  await learning.click();
  await page.waitForURL(`**${basePath}/learning/`);
  assert.equal(await page.locator(".empty-state").count(), 0);
  await page.locator(`a.project-card[href="${basePath}/learning/virtual-character-video/"]`).click();
  await page.waitForURL(`**${basePath}/learning/virtual-character-video/`);
  await page.waitForLoadState("networkidle");
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator("video").count(), 3);
  assert.equal(videoRequests.length, 0, "Videos should not download before visitors choose to play");
  await page.locator("video").evaluateAll(videos => videos.forEach(video => { video.textTracks[0].mode = "hidden"; }));
  await page.waitForFunction(() => [...document.querySelectorAll("video")].every(video => video.textTracks[0]?.cues?.length > 0));
  const metadata = [];
  for (const video of await page.locator("video").all()) {
    assert.equal(await video.getAttribute("preload"), "none");
    assert.equal(await video.getAttribute("autoplay"), null);
    await video.scrollIntoViewIfNeeded();
    await video.evaluate(async element => { element.muted = true; await element.play(); });
    await video.evaluate(element => new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("No decoded video frame")), 60000);
      element.requestVideoFrameCallback(() => { clearTimeout(timeout); resolve(); });
    }));
    await video.evaluate(element => { element.pause(); element.currentTime = element.duration * .65; });
    await page.waitForFunction(element => !element.seeking && element.readyState >= 2, await video.elementHandle(), { timeout: 60000 });
    const item = await video.evaluate(element => ({ src: element.currentSrc, duration: element.duration, width: element.videoWidth, height: element.videoHeight, currentTime: element.currentTime, controls: element.controls, error: element.error?.message ?? null }));
    assert.ok(item.duration > 30 && item.duration < 130);
    assert.equal(item.width, 1920);
    assert.equal(item.height, 1080);
    assert.ok(item.currentTime > item.duration / 2);
    assert.equal(item.error, null);
    assert.ok(item.controls);
    metadata.push(item);
  }
  const layouts = [];
  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(async () => {
      await Promise.all([...document.images].map(image => { image.loading = "eager"; return image.decode(); }));
      await document.fonts.ready;
    });
    const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, images: [...document.images].every(image => image.complete && image.naturalWidth > 0), videosFit: [...document.querySelectorAll("video")].every(video => { const box = video.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth; }) }));
    assert.equal(layout.width, layout.scrollWidth);
    assert.ok(layout.images && layout.videosFit);
    layouts.push(layout);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${output}/article-${width}.png`, fullPage: true });
  }
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("video").count(), 3);
  await page.locator(`.breadcrumb a[href="${basePath}/learning/"]`).click();
  await page.waitForURL(`**${basePath}/learning/`);
  assert.deepEqual(errors, []);
  await writeFile(`${output}/verification.json`, JSON.stringify({ baseURL, metadata, layouts, errors, checks: ["home and learning navigation", "no eager video downloads", "three loaded caption tracks", "three real video frames", "seek beyond midpoint", "responsive layouts", "direct refresh"] }, null, 2));
  console.log(`PASS ${baseURL}: learning entry, 3 playable/seekable 1080p videos, four responsive layouts, refresh, zero browser/HTTP errors`);
} finally { await browser.close(); }
