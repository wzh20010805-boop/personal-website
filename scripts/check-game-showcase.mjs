import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const baseURL = process.env.CHECK_URL ?? "http://127.0.0.1:3000";
const output = new URL("../docs/checks/game-showcase/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
const results = [];
try {
  for (const width of [320, 375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(baseURL, { waitUntil: "networkidle" });
    const games = page.locator("a.category-card[href='/games/']");
    assert.match(await games.innerText(), /1\s*件作品/, "首页应显示已收录的游戏");
    await games.click();
    await page.waitForURL(`${baseURL}/games/`);
    const card = page.locator("a.project-card[href='/games/colony-roads/']");
    assert.equal(await card.count(), 1, "游戏分类应可进入开发进度详情");
    await card.click();
    await page.waitForURL(`${baseURL}/games/colony-roads/`);
    await page.waitForLoadState("networkidle");
    assert.equal(await page.locator("h1").count(), 1);
    for (const title of ["目前做到哪一步", "从地图到一场战斗", "游戏实测实况"]) {
      assert.equal(await page.getByRole("heading", { name: title, exact: true }).count(), 1);
    }
    await page.locator("#screenshots").scrollIntoViewIfNeeded();
    await page.evaluate(async () => { await Promise.all([...document.images].map((image) => image.decode())); });
    assert.equal(await page.locator("#screenshots figure").count(), 4);
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      images: [...document.images].map((image) => ({ src: image.getAttribute("src"), loaded: image.complete && image.naturalWidth > 0, alt: image.alt, fit: getComputedStyle(image).objectFit })),
      brokenAnchors: [...document.querySelectorAll("a[href^='#']")].filter((link) => !document.querySelector(link.getAttribute("href"))).map((link) => link.getAttribute("href")),
    }));
    assert.equal(layout.documentWidth, width, "页面不应横向溢出");
    assert.ok(layout.images.every((image) => image.loaded && image.alt && image.fit === "contain"), "原图应完整加载且有说明");
    assert.deepEqual(layout.brokenAnchors, []);
    const original = page.getByRole("link", { name: "打开制作流程原图" });
    const [popup] = await Promise.all([page.waitForEvent("popup"), original.click()]);
    await popup.waitForLoadState();
    assert.ok(popup.url().endsWith("/images/games/colony-roads/development-flow.png"));
    await popup.close();
    assert.equal((await page.reload({ waitUntil: "networkidle" })).status(), 200);
    assert.deepEqual(errors, []);
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    await page.screenshot({ path: fileURLToPath(new URL(`detail-${width}.png`, output)), fullPage: true });
    results.push({ ...layout, errors, navigation: "passed", originalImage: "passed" });
    await page.close();
  }
  await writeFile(new URL("results.json", output), JSON.stringify(results, null, 2));
  console.log("Game showcase: navigation, 4 real screenshots, original roadmap and 4 responsive widths passed.");
} finally {
  await browser.close();
}
