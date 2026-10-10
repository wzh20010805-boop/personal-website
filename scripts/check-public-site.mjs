import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = (process.env.CHECK_URL ?? "https://wzh20010805-boop.github.io/personal-website").replace(/\/$/, "");
const base = new URL(baseURL);
const basePath = base.pathname.replace(/\/$/, "");
const routes = ["/", "/tools/", "/tools/sprint-motion-studio/", "/tools/pixel-cursor/", "/games/colony-roads/", "/skills/amazon-product-radar/", "/prompts/", "/agents/", "/learning/"];
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
try {
  for (const width of [375, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    for (const route of routes) {
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200, route);
      await page.evaluate(async () => {
        await Promise.all([...document.images].map((image) => { image.loading = "eager"; return image.decode(); }));
      });
      assert.equal(await page.locator("h1").count(), 1, route);
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        images: [...document.images].every((image) => image.complete && image.naturalWidth > 0),
        links: [...document.querySelectorAll("a[href^='/'], image[href^='/']")].map((link) => link.getAttribute("href")),
        background: getComputedStyle(document.body, "::before").backgroundImage,
      }));
      assert.equal(layout.width, width, route);
      assert.ok(layout.images, route);
      assert.ok(layout.links.every((href) => href.startsWith(`${basePath}/`)), `Unprefixed local link: ${route}`);
      assert.ok(layout.background.includes(`${basePath}/illustrations/paper-grain.svg`), "Paper texture path");
      if (route === "/tools/sprint-motion-studio/") {
        assert.match(await page.locator("#screenshots").innerText(), /5s奔跑视频制作\.mp4/);
        assert.equal(await page.locator("#screenshots figure").count(), 3);
        const original = page.getByRole("link", { name: "打开播放预览原图", exact: false });
        const [popup] = await Promise.all([page.waitForEvent("popup"), original.click()]);
        await popup.waitForLoadState();
        assert.equal(popup.url(), `${baseURL}/images/tools/sprint-motion-studio/test-project-preview.png`);
        await popup.close();
      }
      assert.deepEqual(errors, [], route);
    }
    await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
    await page.locator(`a.category-card[href='${basePath}/tools/']`).click();
    await page.waitForURL(`${baseURL}/tools/`);
    await page.locator(`a.project-card[href='${basePath}/tools/sprint-motion-studio/']`).click();
    await page.waitForURL(`${baseURL}/tools/sprint-motion-studio/`);
    await page.getByRole("link", { name: "返回小工具列表" }).click();
    await page.waitForURL(`${baseURL}/tools/`);
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`${width}px: ${routes.length} routes, images, texture, original image and navigation passed.`);
  }
  console.log(`Public website verified: ${baseURL}/`);
} finally {
  await browser.close();
}
