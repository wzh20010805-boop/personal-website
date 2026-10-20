import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const baseURL = (process.env.CHECK_URL ?? "http://127.0.0.1:4174").replace(/\/$/, "");
const basePath = new URL(baseURL).pathname.replace(/\/$/, "");
const output = new URL("../docs/checks/personal-knowledge/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
const results = { baseURL, checkedAt: new Date().toISOString(), viewports: [] };
try {
  for (const width of [320, 375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
    const agents = page.locator(`a.category-card[href='${basePath}/agents/']`);
    assert.match(await agents.innerText(), /1\s*件作品/);
    assert.match(await page.locator(`a.category-card[href='${basePath}/tools/']`).innerText(), /2\s*件作品/);
    await agents.click();
    await page.waitForURL(`${baseURL}/agents/`);
    assert.equal(await page.locator("a.project-card").count(), 1);
    const card = page.locator(`a.project-card[href='${basePath}/agents/personal-knowledge/']`);
    assert.match(await card.innerText(), /源码私有/);
    await card.click();
    await page.waitForURL(`${baseURL}/agents/personal-knowledge/`);
    await page.waitForLoadState("networkidle");
    assert.equal(await page.locator("h1").count(), 1);
    assert.match(await page.locator("h1").innerText(), /个人知识库/);
    assert.match(await page.locator("#demo-note").innerText(), /演示资料与模拟模型输出/);
    assert.match(await page.locator("#demo-note").innerText(), /未调用真实 DeepSeek API/);
    assert.match(await page.locator("#case-study").innerText(), /怎样把读过的资料整理成/);
    assert.match(await page.locator("#data-boundary").innerText(), /会发送用于处理的资料正文或检索片段/);
    assert.match(await page.locator("#project-status").innerText(), /尚未提供公开安装包或在线问答服务/);
    assert.equal(await page.getByRole("link", { name: /下载/ }).count(), 0);
    const repo = page.getByRole("link", { name: "项目仓库（需访问权限）", exact: false });
    assert.equal(await repo.getAttribute("href"), "https://github.com/wzh20010805-boop/personal-knowledge");
    assert.equal(await page.locator("#screenshots figure").count(), 4);
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((image) => { image.loading = "eager"; return image.decode(); }));
    });
    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      images: [...document.images].map((image) => ({ src: image.getAttribute("src"), loaded: image.complete && image.naturalWidth > 0 && image.naturalHeight > 0, alt: image.alt, fit: getComputedStyle(image).objectFit })),
      brokenAnchors: [...document.querySelectorAll("a[href^='#']")].filter((link) => !document.querySelector(link.getAttribute("href"))).map((link) => link.getAttribute("href")),
    }));
    assert.equal(layout.documentWidth, width);
    assert.ok(layout.images.every((image) => image.loaded && image.alt && image.fit === "contain"));
    assert.deepEqual(layout.brokenAnchors, []);
    assert.match(await page.locator("header").last().innerText(), /DeepSeek API/);
    assert.match(await page.locator("#workflow").innerText(), /默认固定 RAG/);
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
    assert.equal((await page.reload({ waitUntil: "networkidle" })).status(), 200);
    await page.evaluate(async () => { await Promise.all([...document.images].map((image) => { image.loading = "eager"; return image.decode(); })); window.scrollTo(0, 0); });
    await page.screenshot({ path: fileURLToPath(new URL(`detail-${width}.png`, output)), fullPage: true });
    await page.getByRole("link", { name: "返回 Agent 列表" }).click();
    await page.waitForURL(`${baseURL}/agents/`);
    await page.goto(`${baseURL}/tools/personal-knowledge/`, { waitUntil: "networkidle" });
    await page.waitForURL(`${baseURL}/agents/personal-knowledge/`);
    await page.goto(`${baseURL}/tools/`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("a.project-card").count(), 2);
    await page.locator(`a.project-card[href='${basePath}/tools/pixel-cursor/']`).click();
    await page.waitForURL(`${baseURL}/tools/pixel-cursor/`);
    assert.match(await page.locator("h1").innerText(), /Pixel Cursor/);
    assert.deepEqual(errors, []);
    results.viewports.push({ width, ...layout, errors, navigation: "passed", originalImage: "passed" });
    await page.close();
  }
  await writeFile(new URL("results.json", output), `${JSON.stringify(results, null, 2)}\n`);
  console.log("Personal Knowledge: 1 Agent, 2 tools, Archify workflow, legacy redirect, 4 demo screenshots, original image, privacy/model labels and 4 viewport widths passed.");
} finally {
  await browser.close();
}
