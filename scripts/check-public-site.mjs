import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = (process.env.CHECK_URL ?? "https://wzh20010805-boop.github.io/personal-website").replace(/\/$/, "");
const base = new URL(baseURL);
const basePath = base.pathname.replace(/\/$/, "");
const routes = ["/", "/tools/", "/tools/sprint-motion-studio/", "/tools/pixel-cursor/", "/agents/personal-knowledge/", "/games/colony-roads/", "/skills/amazon-product-radar/", "/prompts/", "/agents/", "/learning/"];
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
      if (route === "/") {
        const hero = page.locator(".hero-illustration img");
        assert.equal(await hero.count(), 1, "The homepage must contain the original cat illustration");
        assert.equal(await hero.getAttribute("src"), `${basePath}/illustrations/creator-hero-v2.webp`);
        assert.ok(await hero.isVisible(), "The hero illustration must be visible");
        assert.ok(await hero.evaluate((image) => image.complete && image.naturalWidth === 1312), "The hero illustration must load successfully");
      }
      if (route === "/tools/sprint-motion-studio/") {
        assert.match(await page.locator("#screenshots").innerText(), /5s奔跑视频制作\.mp4/);
        assert.equal(await page.locator("#screenshots figure").count(), 4);
        const downloads = page.getByRole("link", { name: "下载 Windows 便携版", exact: false });
        assert.equal(await downloads.count(), 2);
        for (const download of await downloads.all()) assert.equal(await download.getAttribute("href"), "https://github.com/wzh20010805-boop/Sprint-Motion-Studio/releases/download/v1.0.7/SpriteMotionStudio-win-x64-1.0.7.zip");
        assert.match(await page.locator("#getting-started").innerText(), /u2netp/);
        assert.match(await page.locator("#workflow").innerText(), /14 帧/);
        assert.match(await page.locator("#getting-started").innerText(), /已安装模型会继续复用/);
        assert.equal(await page.getByRole("link", { name: "查看14帧动作预览", exact: false }).getAttribute("href"), `${basePath}/images/tools/sprint-motion-studio/v107-run-loop.gif`);
        const original = page.getByRole("link", { name: "打开地面基准与审核导出原图", exact: false });
        const [popup] = await Promise.all([page.waitForEvent("popup"), original.click()]);
        await popup.waitForLoadState();
        assert.equal(popup.url(), `${baseURL}/images/tools/sprint-motion-studio/v107-alignment-workshop.png`);
        await popup.close();
      }
      if (route === "/agents/personal-knowledge/") {
        assert.equal(await page.locator("#screenshots figure").count(), 4);
        assert.match(await page.locator("#demo-note").innerText(), /演示资料与模拟模型输出/);
        assert.match(await page.locator("#project-status").innerText(), /源码仓库为私有/);
        assert.match(await page.locator("#workflow").innerText(), /DeepSeek API/);
        const diagramLink = page.getByRole("link", { name: "打开 Archify 交互流程图", exact: false });
        const [diagram] = await Promise.all([page.waitForEvent("popup"), diagramLink.click()]);
        await diagram.waitForLoadState();
        assert.equal(diagram.url(), `${baseURL}/diagrams/personal-knowledge-workflow.html`);
        assert.equal(await diagram.locator("svg[role='img']").count(), 1);
        await diagram.close();
        const original = page.getByRole("link", { name: "打开引用定位", exact: false });
        const [popup] = await Promise.all([page.waitForEvent("popup"), original.click()]);
        await popup.waitForLoadState();
        assert.equal(popup.url(), `${baseURL}/images/agents/personal-knowledge/source-citation.png`);
        await popup.close();
      }
      assert.deepEqual(errors, [], route);
    }
    await page.goto(`${baseURL}/tools/personal-knowledge/`, { waitUntil: "networkidle" });
    await page.waitForURL(`${baseURL}/agents/personal-knowledge/`);
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
