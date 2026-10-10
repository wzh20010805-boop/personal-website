import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const baseURL = process.env.CHECK_URL ?? "http://127.0.0.1:3000";
const output = new URL("../docs/checks/sprint-motion-studio/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
const results = { baseURL, checkedAt: new Date().toISOString(), viewports: [] };
try {
  for (const width of [320, 375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(baseURL, { waitUntil: "networkidle" });
    const tools = page.locator("a.category-card[href='/tools/']");
    assert.match(await tools.innerText(), /2\s*件作品/, "首页应包含新增工具");
    await tools.click();
    await page.waitForURL(`${baseURL}/tools/`);
    assert.equal(await page.locator("a.project-card").count(), 2);
    await page.locator("a.project-card[href='/tools/sprint-motion-studio/']").click();
    await page.waitForURL(`${baseURL}/tools/sprint-motion-studio/`);
    await page.waitForLoadState("networkidle");
    assert.equal(await page.locator("h1").count(), 1);
    assert.match(await page.locator("h1").innerText(), /Sprint\s+Motion\s+Studio/);
    for (const title of ["目前能做什么", "从视频到逐帧素材", "真实桌面测试画面", "下一步，走向游戏素材管线"]) {
      assert.equal(await page.getByRole("heading", { name: title, exact: true }).count(), 1);
    }
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((image) => { image.loading = "eager"; return image.decode(); }));
    });
    assert.equal(await page.locator("#screenshots figure").count(), 3);
    const layout = await page.evaluate(() => ({
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      images: [...document.images].map((image) => ({ src: image.getAttribute("src"), loaded: image.complete && image.naturalWidth > 0, alt: image.alt, fit: getComputedStyle(image).objectFit })),
      brokenAnchors: [...document.querySelectorAll("a[href^='#']")].filter((link) => !document.querySelector(link.getAttribute("href"))).map((link) => link.getAttribute("href")),
    }));
    assert.equal(layout.documentWidth, width);
    assert.ok(layout.images.every((image) => image.loaded && image.alt && image.fit === "contain"));
    assert.deepEqual(layout.brokenAnchors, []);
    assert.match(await page.locator("#scope-note").innerText(), /原始.*背景/);
    const source = page.getByRole("link", { name: "查看源码与说明", exact: false });
    assert.equal(await source.getAttribute("href"), "https://github.com/wzh20010805-boop/Sprint-Motion-Studio");
    const original = page.getByRole("link", { name: "打开默认导入模式原图", exact: false });
    const [popup] = await Promise.all([page.waitForEvent("popup"), original.click()]);
    await popup.waitForLoadState();
    assert.ok(popup.url().endsWith("/images/tools/sprint-motion-studio/import-defaults.png"));
    await popup.close();
    assert.equal((await page.reload({ waitUntil: "networkidle" })).status(), 200);
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    await page.screenshot({ path: fileURLToPath(new URL(`detail-${width}.png`, output)), fullPage: true });
    assert.deepEqual(errors, []);
    await page.getByRole("link", { name: "返回小工具列表" }).click();
    await page.waitForURL(`${baseURL}/tools/`);
    await page.locator("a.project-card[href='/tools/pixel-cursor/']").click();
    await page.waitForURL(`${baseURL}/tools/pixel-cursor/`);
    assert.match(await page.locator("h1").innerText(), /Pixel Cursor/);
    results.viewports.push({ ...layout, errors, navigation: "passed", originalImage: "passed" });
    await page.close();
  }
  await writeFile(new URL("results.json", output), JSON.stringify(results, null, 2));
  console.log("Sprint Motion Studio: two tool cards, detail navigation, real images, original-image links and 4 viewport widths passed.");
} finally {
  await browser.close();
}
