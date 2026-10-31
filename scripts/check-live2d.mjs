import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const baseURL = process.env.CHECK_URL ?? "http://127.0.0.1:3010";
const browser = await chromium.launch({
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  const failedRequests = [];
  const externalRequests = [];
  const modelRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
  page.on("requestfailed", (request) => { if (request.failure()?.errorText !== "net::ERR_ABORTED") failedRequests.push(request.url()); });
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL).origin) externalRequests.push(request.url());
    if (request.url().endsWith("character.model3.json")) modelRequests.push(request.url());
  });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const pet = page.getByRole("region", { name: "Live2D 网页伙伴" });
  await pet.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready", null, { timeout: 30000 });
  assert.equal(await pet.locator("canvas").count(), 1);
  const desktopStage = await pet.locator("canvas").boundingBox();
  assert.equal(desktopStage.width, 440, "Desktop character width must be twice the original 220px");
  assert.equal(desktopStage.height, 560, "Desktop character height must be twice the original 280px");
  const canvas = await pet.locator("canvas").elementHandle();
  const sampleCanvas = (target = pet) => target.locator("canvas").evaluate((source) => {
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;
    const context = copy.getContext("2d");
    context.drawImage(source, 0, 0);
    const { data } = context.getImageData(0, 0, copy.width, copy.height);
    let visible = 0;
    let transparent = 0;
    let hash = 0;
    let left = copy.width;
    let top = copy.height;
    let right = 0;
    let bottom = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3]) visible++;
      else transparent++;
      if (data[i + 3] > 16) {
        const x = (i / 4) % copy.width;
        const y = Math.floor(i / 4 / copy.width);
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
      hash = (Math.imul(hash, 31) + data[i] + data[i + 1] * 3 + data[i + 2] * 7 + data[i + 3] * 11) | 0;
    }
    const ratio = source.clientWidth / copy.width;
    return { visible, transparent, hash, width: (right - left + 1) * ratio, height: (bottom - top + 1) * ratio, unclipped: left > 1 && top > 1 && right < copy.width - 2 && bottom < copy.height - 2 };
  });
  const first = await sampleCanvas();
  assert.ok(first.visible > 1000, "The actual character must be rendered, not an empty canvas");
  assert.ok(first.transparent > 1000, "The character background must be transparent");
  assert.ok(first.width >= 380 && first.height >= 500, "The visible character itself must fill the desktop stage, not just enlarge an empty canvas");
  assert.ok(first.unclipped, "The enlarged character must retain space around the artwork");
  const hit = await pet.getByRole("button", { name: "和网页伙伴互动，也可以拖动位置" }).boundingBox();
  const acceptsPetClick = (point) => page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest("[data-pet-status]"), point);
  assert.equal(await acceptsPetClick({ x: hit.x + 3, y: hit.y + 3 }), false, "The transparent corner of the character hit area must let page clicks through");
  assert.equal(await acceptsPetClick({ x: hit.x + hit.width / 2, y: hit.y + hit.height / 2 }), true, "The character body must remain interactive");
  assert.equal(await acceptsPetClick({ x: desktopStage.x + 4, y: desktopStage.y + 4 }), false, "Blank canvas space must not intercept page clicks");
  console.log(`PASS: visible artwork is ${Math.round(first.width)}×${Math.round(first.height)}px, remains unclipped, and blank corners pass clicks through`);

  const tracking = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const trackingErrors = [];
  let trackingModelRequests = 0;
  tracking.on("pageerror", (error) => trackingErrors.push(error.message));
  tracking.on("request", (request) => { if (request.url().endsWith("character.model3.json")) trackingModelRequests++; });
  await tracking.route("**/character.model3.json", async (route) => {
    await tracking.evaluate(() => {
      if (window.trackingModels) return;
      const prototype = window.PIXI.live2d.Live2DModel.prototype;
      const init = prototype.init;
      window.trackingModels = [];
      prototype.init = function (...args) {
        window.trackingModels.push(this);
        const result = init.apply(this, args);
        const internal = this.internalModel;
        const core = internal.coreModel;
        const ids = ["ParamAngleX", "ParamAngleY", "ParamBodyAngleX", "ParamEyeBallX", "ParamEyeBallY", "ParamAngleZ"];
        const read = () => Object.fromEntries(ids.map((id) => [id, core.getParameterValueById(id)]));
        let authored;
        internal.on("afterMotionUpdate", () => { authored = read(); });
        internal.on("beforeModelUpdate", () => {
          window.trackingFrame = {
            number: (window.trackingFrame?.number ?? 0) + 1,
            authored,
            rendered: read(),
            ranges: Object.fromEntries(ids.map((id) => {
              const index = core.getParameterIndex(id);
              return [id, [core.getParameterMinimumValue(index), core.getParameterMaximumValue(index)]];
            })),
          };
        });
        return result;
      };
    });
    await route.continue();
  });
  await tracking.goto(baseURL, { waitUntil: "networkidle" });
  const trackedPet = tracking.getByRole("region", { name: "Live2D 网页伙伴" });
  await tracking.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready" && window.trackingFrame);
  const trackedCanvas = await trackedPet.locator("canvas").elementHandle();
  function assertTrackingPose(point, box, frame) {
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const x = clamp((point.x - box.x) / box.width * 2 - 1, -1, 1);
    const y = clamp(1 - (point.y - box.y) / box.height * 2, -1, 1);
    // PSD2Live 3.4.5's direct-mode bindings; rotation Z stays authored.
    const offsets = { ParamAngleX: x * 30, ParamAngleY: y * 30, ParamBodyAngleX: x * 10, ParamEyeBallX: x, ParamEyeBallY: y, ParamAngleZ: 0 };
    for (const [id, offset] of Object.entries(offsets)) {
      const expected = clamp(frame.authored[id] + offset, ...frame.ranges[id]);
      assert.ok(Math.abs(frame.rendered[id] - expected) < 0.01, `${id} must follow the pointer using PSD2Live's mapping: expected ${expected}, received ${frame.rendered[id]}`);
    }
  }
  async function nextTrackingFrame() {
    const frame = await tracking.evaluate(() => window.trackingFrame.number);
    await tracking.waitForFunction((number) => window.trackingFrame.number >= number + 2, frame);
    return tracking.evaluate(() => window.trackingFrame);
  }
  async function checkPointer(point) {
    await tracking.mouse.move(point.x, point.y);
    const frame = await nextTrackingFrame();
    assertTrackingPose(point, await trackedPet.locator("canvas").boundingBox(), frame);
    return sampleCanvas(trackedPet);
  }
  const trackingBox = await trackedPet.locator("canvas").boundingBox();
  const leftPose = await checkPointer({ x: trackingBox.x + trackingBox.width * 0.325, y: trackingBox.y + trackingBox.height * 0.35 });
  const rightPose = await checkPointer({ x: trackingBox.x + trackingBox.width * 0.675, y: trackingBox.y + trackingBox.height * 0.65 });
  assert.notEqual(leftPose.hash, rightPose.hash, "Mouse following must change the rendered character");
  await checkPointer({ x: 40, y: 40 });
  await tracking.mouse.move(-20, -20);
  const resetPose = await nextTrackingFrame();
  for (const id of Object.keys(resetPose.rendered)) assert.ok(Math.abs(resetPose.rendered[id] - resetPose.authored[id]) < 0.01, "Leaving the page must restore the authored pose");
  await tracking.locator('a.category-card[href="/tools/"]').click();
  await tracking.waitForURL("**/tools/");
  await tracking.locator('a.project-card[href="/tools/pixel-cursor/"]').click();
  await tracking.waitForURL("**/tools/pixel-cursor/");
  assert.ok(await trackedCanvas.evaluate((element) => element.isConnected));
  assert.equal(trackingModelRequests, 1);
  const beforeScale = await trackedPet.locator("canvas").boundingBox();
  const stationaryPointer = { x: beforeScale.x + beforeScale.width / 2, y: beforeScale.y + beforeScale.height / 2 };
  await checkPointer(stationaryPointer);
  await trackedPet.getByRole("button", { name: "陪你逛逛" }).press("Enter");
  const trackingSize = trackedPet.getByRole("slider", { name: "人物大小", exact: true });
  await trackingSize.press("Home");
  for (let i = 0; i < 5; i++) await trackingSize.press("ArrowRight");
  await tracking.waitForFunction(() => document.querySelector("[data-pet-status] canvas")?.clientWidth === 220);
  assertTrackingPose(stationaryPointer, await trackedPet.locator("canvas").boundingBox(), await nextTrackingFrame());
  await tracking.evaluate(() => window.dispatchEvent(new Event("blur")));
  const blurredPose = await nextTrackingFrame();
  for (const id of Object.keys(blurredPose.rendered)) assert.ok(Math.abs(blurredPose.rendered[id] - blurredPose.authored[id]) < 0.01, "Losing window focus must clear cursor tracking");
  await trackedPet.getByRole("button", { name: "退出互动", exact: true }).click();
  await tracking.mouse.move(40, 40);
  await tracking.getByRole("button", { name: "召回伙伴" }).click();
  await tracking.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready");
  await checkPointer({ x: 80, y: 80 });
  assert.equal(await tracking.evaluate(() => window.trackingModels[0].destroyed), true);
  assert.equal(trackingModelRequests, 2);
  assert.deepEqual(trackingErrors, []);
  await tracking.close();
  console.log("PASS: real eye/head/body parameters follow PSD2Live's cursor mapping, without added tilt; following survives routes, resizing and recall, and resets on leave/blur");

  await pet.getByRole("button", { name: "陪你逛逛" }).click();
  assert.equal(await pet.getByRole("slider", { name: "人物大小", exact: true }).count(), 1, "Visitors must be able to resize the character from its interaction menu");
  const initialPanel = await pet.getByRole("group", { name: "伙伴互动菜单" }).boundingBox();
  const initialControl = await pet.getByRole("button", { name: "陪你逛逛" }).boundingBox();
  assert.ok(Math.abs(hit.x - initialPanel.x - initialPanel.width - 8) < 2, "The menu must sit immediately beside the character");
  assert.ok(Math.abs(initialPanel.y + initialPanel.height - initialControl.y - initialControl.height) < 2, "The menu must align with the character controls, not the viewport floor");
  assert.ok(initialControl.y - hit.y - hit.height <= 8, "Controls must remain close to the character's feet");
  assert.equal(await pet.locator("button[data-motion]").count(), 17);
  assert.equal(await pet.locator('button[data-motion="Point7"]').count(), 0, "The removed pointing motion must not remain in the menu");
  for (const id of ["NaturalIdle36", "AttentiveIdle24", "RelaxedIdle30", "Greeting8", "NodYes6", "HeadShake6", "CuriousTilt8", "JoySmile6", "SoftWink4", "LookAround12", "Thoughtful8", "Wave7", "motion_18", "HeadTiltArmClearance", "HandsOnHips7", "motion_19", "GestureSequence18"]) {
    await pet.locator(`button[data-motion="${id}"]`).click();
    await page.waitForFunction((expected) => document.querySelector("[data-pet-motion]")?.getAttribute("data-pet-motion") === expected, id);
    await page.waitForTimeout(180);
  }
  const second = await sampleCanvas();
  assert.notEqual(first.hash, second.hash, "The rendered pose must actually change");
  await pet.locator('button[data-motion="SoftWink4"]').click();
  await page.waitForFunction(() => document.querySelector("[data-pet-motion]")?.getAttribute("data-pet-motion") === "RelaxedIdle30", null, { timeout: 8000 });
  assert.equal(await pet.locator('button[data-motion="RelaxedIdle30"]').getAttribute("aria-pressed"), "true");
  console.log("PASS: all 17 motions start, the rendered pose changes, and one-shot actions return to the chosen idle");

  await pet.getByRole("button", { name: "收起互动菜单" }).click();
  const beforeDrag = await pet.boundingBox();
  const handle = await pet.getByRole("button", { name: "拖动伙伴", exact: true }).boundingBox();
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x - 130, handle.y - 90, { steps: 8 });
  await page.mouse.up();
  const afterDrag = await pet.boundingBox();
  assert.ok(afterDrag.x < beforeDrag.x - 100 && afterDrag.y < beforeDrag.y - 60, "Dragging must move the pet");

  await page.locator('a.category-card[href="/tools/"]').click();
  await page.waitForURL("**/tools/");
  assert.ok(await canvas.evaluate((element) => element.isConnected), "The same canvas must survive category navigation");
  await page.locator('a.project-card[href="/tools/pixel-cursor/"]').click();
  await page.waitForURL("**/tools/pixel-cursor/");
  assert.ok(await canvas.evaluate((element) => element.isConnected), "The same canvas must survive nested navigation");
  assert.equal(await pet.getAttribute("data-pet-status"), "ready");
  assert.equal(modelRequests.length, 1, "Route changes must not reload the model");
  const afterNavigation = await pet.boundingBox();
  assert.ok(Math.abs(afterNavigation.x - afterDrag.x) < 2 && Math.abs(afterNavigation.y - afterDrag.y) < 2);
  await page.goBack();
  await page.waitForURL("**/tools/");
  assert.ok(await canvas.evaluate((element) => element.isConnected), "Browser back must preserve the pet");
  console.log("PASS: dragging, category and nested navigation, and browser back keep the same live model and position");

  await pet.getByRole("button", { name: "陪你逛逛" }).click();
  const draggedPanel = await pet.getByRole("group", { name: "伙伴互动菜单" }).boundingBox();
  const draggedControl = await pet.getByRole("button", { name: "陪你逛逛" }).boundingBox();
  assert.ok(Math.abs(draggedPanel.y + draggedPanel.height - draggedControl.y - draggedControl.height) < 2, "Dragging must also move the menu anchor");
  await page.keyboard.press("Escape");
  assert.equal(await pet.getByRole("group", { name: "伙伴互动菜单" }).count(), 0);
  assert.equal(await pet.isVisible(), true, "Escape only closes the menu");
  await pet.getByRole("button", { name: "和网页伙伴互动，也可以拖动位置" }).press("Enter");
  await pet.getByRole("button", { name: "退出互动", exact: true }).click();
  assert.equal(await pet.count(), 0);
  await page.locator(".site-brand").click();
  await page.waitForURL(baseURL + "/");
  assert.equal(await pet.count(), 0, "Explicit dismissal must survive route changes");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await pet.count(), 0, "Explicit dismissal must survive refresh");
  const requestsBeforeRecall = modelRequests.length;
  await page.getByRole("button", { name: "召回伙伴" }).click();
  await page.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready", null, { timeout: 15000 });
  assert.equal(await pet.locator("canvas").count(), 1);
  assert.equal(modelRequests.length, requestsBeforeRecall + 1);
  console.log("PASS: only explicit exit dismisses the pet; dismissal survives navigation/refresh and recall restores it");

  await mkdir(new URL("../output/live2d-checks/", import.meta.url), { recursive: true });
  await page.waitForFunction(() => {
    const source = document.querySelector("[data-pet-status] canvas");
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;
    const context = copy.getContext("2d");
    context.drawImage(source, 0, 0);
    return context.getImageData(0, 0, copy.width, copy.height).data.some((value, index) => index % 4 === 3 && value > 0);
  });
  await page.screenshot({ path: fileURLToPath(new URL("../output/live2d-checks/desktop.png", import.meta.url)) });
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 740 });
    await page.waitForFunction((expected) => document.querySelector("[data-pet-status] canvas")?.clientWidth === expected, width <= 600 ? Math.min(332, width - 24) : 440);
    const box = await pet.boundingBox();
    assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= 740, `${width}px pet must remain inside the viewport`);
    await pet.getByRole("button", { name: "陪你逛逛" }).click();
    const panel = await pet.getByRole("group", { name: "伙伴互动菜单" }).boundingBox();
    assert.ok(panel.x >= 0 && panel.y >= 0 && panel.x + panel.width <= width && panel.y + panel.height <= 740, `${width}px menu must remain inside the viewport`);
    if (width <= 600) {
      const character = await pet.getByRole("button", { name: "和网页伙伴互动，也可以拖动位置" }).boundingBox();
      assert.ok(panel.y + panel.height <= character.y, "On mobile the menu must leave the animated character visible");
      assert.ok(character.y - panel.y - panel.height <= 10, "The mobile menu must stay close to the character");
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    await page.screenshot({ path: fileURLToPath(new URL(`../output/live2d-checks/menu-${width}.png`, import.meta.url)) });
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 375, height: 480 });
  await pet.getByRole("button", { name: "陪你逛逛" }).click();
  const shortPanel = await pet.getByRole("group", { name: "伙伴互动菜单" }).boundingBox();
  const shortCharacter = await pet.getByRole("button", { name: "和网页伙伴互动，也可以拖动位置" }).boundingBox();
  assert.ok(shortPanel.height >= 100 && shortPanel.y + shortPanel.height <= shortCharacter.y, "Short screens must retain a usable menu above the character");
  await page.keyboard.press("Escape");
  assert.deepEqual(errors, []);
  assert.deepEqual(failedRequests, []);
  assert.deepEqual(externalRequests, []);
  console.log("PASS: 320/375/768px layouts, no runtime errors, no failed assets, no external requests");

  const sizing = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const sizeErrors = [];
  let sizeModelRequests = 0;
  sizing.on("pageerror", (error) => sizeErrors.push(error.message));
  sizing.on("request", (request) => { if (request.url().endsWith("character.model3.json")) sizeModelRequests++; });
  await sizing.goto(baseURL, { waitUntil: "networkidle" });
  const sizedPet = sizing.getByRole("region", { name: "Live2D 网页伙伴" });
  await sizing.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready");
  const sizedCanvas = await sizedPet.locator("canvas").elementHandle();
  await sizedPet.getByRole("button", { name: "陪你逛逛" }).click();
  const slider = sizedPet.getByRole("slider", { name: "人物大小", exact: true });
  assert.equal(await slider.inputValue(), "100");
  await sizedPet.locator('button[data-motion="RelaxedIdle30"]').click();
  await sizing.mouse.move(-20, -20);
  await sizing.waitForTimeout(80);
  const normalSize = await sampleCanvas(sizedPet);
  async function setSizeByKeyboard(key, expectedWidth) {
    await slider.press(key);
    await sizing.waitForFunction((width) => document.querySelector("[data-pet-status] canvas")?.clientWidth === width, expectedWidth);
    await sizing.waitForTimeout(120);
    return sampleCanvas(sizedPet);
  }
  const smallest = await setSizeByKeyboard("Home", 110);
  assert.ok(Math.abs(smallest.height / normalSize.height - 0.25) < 0.02 && Math.abs(smallest.width / normalSize.width - 0.25) < 0.02, "25% must shrink the visible artwork itself");
  const largest = await setSizeByKeyboard("End", 880);
  assert.ok(Math.abs(largest.height / normalSize.height - 2) < 0.03 && Math.abs(largest.width / normalSize.width - 2) < 0.03, "200% must enlarge the visible artwork itself when the viewport has room");
  assert.ok(largest.unclipped, "Enlarging must not crop the artwork");
  assert.ok(await sizedCanvas.evaluate((element) => element.isConnected));
  assert.equal(sizeModelRequests, 1, "Resizing must keep the same live model instead of reloading it");
  assert.equal(await sizedPet.getAttribute("data-pet-motion"), "RelaxedIdle30", "Resizing must not restart the current motion");
  await sizedPet.getByRole("button", { name: "恢复默认大小", exact: true }).click();
  await sizing.waitForFunction(() => document.querySelector("[data-pet-status] canvas")?.clientWidth === 440);
  assert.equal(await slider.inputValue(), "100");

  const sliderBox = await slider.boundingBox();
  const menuBeforeResize = await sizedPet.getByRole("group", { name: "伙伴互动菜单" }).boundingBox();
  await sizing.mouse.move(sliderBox.x + sliderBox.width * 0.43, sliderBox.y + sliderBox.height / 2);
  await sizing.mouse.down();
  await sizing.mouse.move(sliderBox.x + sliderBox.width * 0.2, sliderBox.y + sliderBox.height / 2, { steps: 8 });
  await sizing.waitForTimeout(120);
  const menuDuringResize = await sizedPet.getByRole("group", { name: "伙伴互动菜单" }).boundingBox();
  assert.ok(Math.abs(menuDuringResize.x - menuBeforeResize.x) < 2 && Math.abs(menuDuringResize.y - menuBeforeResize.y) < 2, "The slider must not chase the pointer while dragging it");
  await sizing.mouse.up();
  await slider.press("Home");
  for (let i = 0; i < 5; i++) await slider.press("ArrowRight");
  assert.equal(await slider.inputValue(), "50");
  await sizing.keyboard.press("Escape");
  await sizing.locator('a.category-card[href="/tools/"]').click();
  await sizing.waitForURL("**/tools/");
  assert.ok(await sizedCanvas.evaluate((element) => element.isConnected));
  await sizing.reload({ waitUntil: "networkidle" });
  await sizing.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready");
  await sizedPet.getByRole("button", { name: "陪你逛逛" }).click();
  assert.equal(await slider.inputValue(), "50", "The chosen size must survive navigation and refresh");
  assert.equal(await sizedPet.locator("canvas").evaluate((element) => element.clientWidth), 220);
  await sizedPet.getByRole("button", { name: "退出互动", exact: true }).click();
  await sizing.getByRole("button", { name: "召回伙伴" }).click();
  await sizing.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready");
  await sizedPet.getByRole("button", { name: "陪你逛逛" }).click();
  assert.equal(await slider.inputValue(), "50", "Recall must preserve the chosen size");
  await sizing.setViewportSize({ width: 375, height: 480 });
  await slider.press("End");
  await sizing.waitForTimeout(160);
  for (const target of [sizedPet, sizedPet.getByRole("group", { name: "伙伴互动菜单" }), slider, sizedPet.getByRole("button", { name: "陪你逛逛" })]) {
    const box = await target.boundingBox();
    assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= 375 && box.y + box.height <= 480, "Large sizes must keep the character and size controls inside short mobile screens");
  }
  assert.equal(await sizing.evaluate(() => document.documentElement.scrollWidth), 375);
  await sizing.setViewportSize({ width: 768, height: 740 });
  await sizing.waitForTimeout(160);
  assert.equal(await slider.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2) === element;
  }), true, "When a large character leaves no side space, its size slider must still be visible and clickable");
  assert.deepEqual(sizeErrors, []);
  await sizing.close();
  console.log("PASS: 25–200% scales the actual artwork live, pointer/keyboard controls and reset work, size persists, and small screens remain usable");

  const blocked = await browser.newPage();
  await blocked.route("**/character-*.moc3.gz.part1", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await blocked.goto(baseURL, { waitUntil: "networkidle" });
  await blocked.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "error");
  await blocked.getByRole("button", { name: "陪你逛逛" }).click();
  await blocked.unroute("**/character-*.moc3.gz.part1");
  await blocked.getByRole("button", { name: "重新加载伙伴" }).click();
  await blocked.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready");
  assert.equal(await blocked.locator('[data-pet-status] canvas').count(), 1);
  await blocked.close();
  console.log("PASS: failed model loading keeps controls available and retry recovers");

  const textureFailure = await browser.newPage();
  await textureFailure.route("**/character.model3.json", async (route) => {
    await textureFailure.evaluate(() => {
      const prototype = window.PIXI.live2d.Live2DModel.prototype;
      const init = prototype.init;
      window.live2dTestInstances = [];
      prototype.init = function (...args) {
        window.live2dTestInstances.push(this);
        return init.apply(this, args);
      };
    });
    await route.continue();
  });
  await textureFailure.route("**/textures/**", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await textureFailure.goto(baseURL, { waitUntil: "networkidle" });
  await textureFailure.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "error");
  assert.equal(await textureFailure.evaluate(() => window.live2dTestInstances[0]?.internalModel?.destroyed), true, "Texture failure must release the partially constructed Cubism model");
  await textureFailure.unroute("**/textures/**");
  await textureFailure.getByRole("button", { name: "陪你逛逛" }).click();
  await textureFailure.getByRole("button", { name: "重新加载伙伴" }).click();
  await textureFailure.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready", null, { timeout: 10000 });
  await textureFailure.close();
  console.log("PASS: texture failures release partial models and retry reloads the textures");

  const cancelled = await browser.newPage();
  let releaseTextures;
  const textureGate = new Promise((resolve) => { releaseTextures = resolve; });
  await cancelled.route("**/character.model3.json", async (route) => {
    await cancelled.evaluate(() => {
      if (window.live2dTestInstances) return;
      const prototype = window.PIXI.live2d.Live2DModel.prototype;
      const init = prototype.init;
      window.live2dTestInstances = [];
      prototype.init = function (...args) {
        window.live2dTestInstances.push(this);
        return init.apply(this, args);
      };
    });
    await route.continue();
  });
  await cancelled.route("**/textures/**", async (route) => { await textureGate; await route.continue(); });
  await cancelled.goto(baseURL, { waitUntil: "domcontentloaded" });
  await cancelled.waitForFunction(() => window.live2dTestInstances?.length === 1);
  await cancelled.getByRole("button", { name: "陪你逛逛" }).click();
  await cancelled.getByRole("button", { name: "退出互动", exact: true }).click();
  await cancelled.getByRole("button", { name: "召回伙伴" }).click();
  await cancelled.waitForTimeout(150);
  assert.equal(await cancelled.evaluate(() => window.live2dTestInstances.length), 1, "Recall must wait for cancelled setup to release shared resources");
  releaseTextures();
  await cancelled.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready", null, { timeout: 15000 });
  assert.equal(await cancelled.evaluate(() => window.live2dTestInstances[0].destroyed), true);
  assert.equal(await cancelled.evaluate(() => window.live2dTestInstances[1].textures.every((texture) => texture.valid && texture.baseTexture.valid)), true);
  await cancelled.close();
  console.log("PASS: exiting during texture loading and immediately recalling safely releases the old model");

  const quota = await browser.newPage();
  await quota.addInitScript(() => {
    sessionStorage.setItem("creator-space:live2d:v1", JSON.stringify({ dismissed: false, idle: "NaturalIdle36" }));
    Storage.prototype.setItem = () => { throw new DOMException("Storage is full", "QuotaExceededError"); };
  });
  await quota.goto(baseURL, { waitUntil: "networkidle" });
  await quota.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready");
  await quota.getByRole("button", { name: "陪你逛逛" }).click();
  await quota.getByRole("button", { name: "退出互动", exact: true }).click();
  assert.equal(await quota.locator("[data-pet-status]").count(), 0, "Exit must work even when storage reads succeed but writes fail");
  await quota.getByRole("button", { name: "召回伙伴" }).click();
  await quota.waitForFunction(() => document.querySelector("[data-pet-status]")?.getAttribute("data-pet-status") === "ready");
  await quota.close();
  console.log("PASS: exit and recall also work when browser storage is full");

} finally {
  await browser.close();
}
