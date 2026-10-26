import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.CHECK_URL ?? "http://127.0.0.1:3010", { waitUntil: "networkidle" });
  const pet = page.getByRole("region", { name: "Live2D 网页伙伴" });
  await page.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready");
  await pet.getByRole("button", { name: "陪你逛逛" }).click();
  await pet.locator('button[data-motion="NaturalIdle36"]').click();
  await page.waitForTimeout(80);
  await pet.locator('button[data-motion="NaturalIdle36"]').click();
  const repeatMessage = await pet.locator('[aria-live="polite"]').textContent();

  await page.evaluate(() => {
    const source = document.querySelector("[data-pet-status] canvas");
    const copy = document.createElement("canvas");
    copy.width = copy.height = 64;
    const context = copy.getContext("2d", { willReadFrequently: true });
    const frames = [];
    let frame;
    const sample = (phase) => {
      context.clearRect(0, 0, 64, 64);
      context.drawImage(source, 0, 0, 64, 64);
      const pixels = context.getImageData(0, 0, 64, 64).data;
      let visible = 0;
      for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 16) visible++;
      frames.push({ phase, visible, width: source.width, cssWidth: source.clientWidth });
    };
    const tick = () => { sample("frame"); frame = requestAnimationFrame(tick); };
    const observer = new ResizeObserver(() => sample("resize"));
    observer.observe(source.parentElement);
    frame = requestAnimationFrame(tick);
    window.finishPetResizeCapture = () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      return frames;
    };
  });

  const slider = pet.getByRole("slider", { name: "人物大小", exact: true });
  await slider.focus();
  await slider.press("Home");
  for (let sweep = 0; sweep < 2; sweep++) {
    for (let index = 0; index < 35; index++) await slider.press("ArrowRight");
    for (let index = 0; index < 35; index++) await slider.press("ArrowLeft");
  }
  const sliderBox = await slider.boundingBox();
  const left = sliderBox.x + 10;
  const right = sliderBox.x + sliderBox.width - 10;
  const y = sliderBox.y + sliderBox.height / 2;
  await page.mouse.move(left, y);
  await page.mouse.down();
  for (let sweep = 0; sweep < 2; sweep++) {
    await page.mouse.move(right, y, { steps: 35 });
    await page.mouse.move(left, y, { steps: 35 });
  }
  await page.mouse.up();
  await page.waitForTimeout(80);
  const frames = await page.evaluate(() => window.finishPetResizeCapture());
  const blank = frames.filter((frame) => frame.visible === 0);
  const resized = frames.filter((frame) => frame.phase === "resize");
  console.log(JSON.stringify({ samples: frames.length, resizeSamples: resized.length, blankFrames: blank.length, blankExamples: blank.slice(0, 5), repeatMessage }));
  assert.ok(resized.length >= 50, "Exercise sustained live resizing across the full range");
  assert.equal(blank.length, 0, "Live resizing must never present a blank character canvas");
  assert.ok(!repeatMessage.includes("暂时没有播放成功"), "Selecting the currently playing idle must not report a playback failure");
  assert.deepEqual(errors, []);
  console.log("PASS: live resizing retains rendered pixels on every sampled frame and repeating the current idle succeeds");
} finally {
  await browser.close();
}
