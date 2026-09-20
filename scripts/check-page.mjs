import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const baseURL = process.env.CHECK_URL ?? "http://127.0.0.1:3000";
const output = new URL("../docs/checks/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const results = { baseURL, checkedAt: new Date().toISOString(), browser: await browser.version(), viewports: [], keyboard: [] };

try {
  for (const width of [320, 375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
    const errors = [];
    const failedRequests = [];
    const externalRequests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("requestfailed", (request) => failedRequests.push(request.url()));
    page.on("request", (request) => { if (new URL(request.url()).origin !== new URL(baseURL).origin) externalRequests.push(request.url()); });
    page.on("response", (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
    const response = await page.goto(baseURL, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200, "Homepage must return 200");
    await page.locator(".hero-illustration img").waitFor({ state: "visible" });
    await page.evaluate(async () => { await Promise.all([...document.images].map((image) => image.decode())); });
    const measured = await page.evaluate(() => {
      const github = document.querySelector('.hero-actions a[href^="https://github.com/"]');
      const email = document.querySelector(".hero-contact");
      const grid = getComputedStyle(document.querySelector(".category-grid"));
      const hero = document.querySelector(".hero-copy").getBoundingClientRect();
      const scene = document.querySelector(".hero-illustration").getBoundingClientRect();
      const title = document.querySelector("h1").getBoundingClientRect();
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        language: document.documentElement.lang,
        title: document.title,
        columns: grid.gridTemplateColumns.split(" ").length,
        heroArrangement: scene.top >= hero.bottom ? "stacked" : "side-by-side",
        headingFits: title.right <= innerWidth && title.left >= 0,
        categoryTitles: [...document.querySelectorAll(".category-card h3")].map((el) => el.textContent),
        linkedCategories: document.querySelectorAll("a.category-card").length,
        categoryHrefs: [...document.querySelectorAll("a.category-card")].map((anchor) => anchor.getAttribute("href")),
        githubHref: github?.getAttribute("href"),
        githubLabel: github?.textContent,
        githubPlaceholderExists: document.querySelector("#github-note") !== null,
        emailHref: email?.getAttribute("href"),
        emailLabel: email?.textContent,
        contactFits: !!email && email.getBoundingClientRect().right <= innerWidth && email.getBoundingClientRect().left >= 0,
        buttons: [...document.querySelectorAll(".candy-button")].map((el) => ({ text: el.textContent, height: el.getBoundingClientRect().height })),
        images: [...document.images].map((image) => ({ src: image.getAttribute("src"), alt: image.alt, loaded: image.complete && image.naturalWidth > 0 })),
        hashLinks: [...document.querySelectorAll("a[href^='#']")].map((anchor) => ({ href: anchor.getAttribute("href"), targetExists: !!document.querySelector(anchor.getAttribute("href")) })),
        motions: [...document.querySelectorAll("body *")].filter((el) => {
          const style = getComputedStyle(el);
          return style.animationName !== "none" || style.transitionDuration.split(",").some((duration) => parseFloat(duration) > 0);
        }).map((el) => el.tagName + "." + el.className),
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        activeAnimations: document.getAnimations().length,
        projectPreviewExists: document.querySelector(".project-preview") !== null,
      };
    });
    assert.equal(measured.documentWidth, width, `${width}px document overflow`);
    assert.equal(measured.bodyWidth, width, `${width}px body overflow`);
    assert.equal(measured.language, "zh-CN");
    assert.equal(measured.columns, width >= 1024 ? 3 : width > 700 ? 2 : 1);
    assert.equal(measured.heroArrangement, width > 700 ? "side-by-side" : "stacked");
    assert.ok(measured.headingFits);
    assert.deepEqual(measured.categoryTitles, ["我推荐的 Prompt", "我做的小工具", "我做的小游戏", "我做的 Skill", "我做的 Agent", "我的学习与技术积累"]);
    assert.equal(measured.linkedCategories, 6);
    assert.deepEqual(measured.categoryHrefs, ["/prompts/", "/tools/", "/games/", "/skills/", "/agents/", "/learning/"]);
    assert.equal(measured.githubHref, "https://github.com/wzh20010805-boop");
    assert.ok(measured.githubLabel.includes("查看作者 GitHub 主页"));
    assert.equal(measured.githubPlaceholderExists, false);
    assert.equal(measured.emailHref, "mailto:wzh20010805@gmail.com");
    assert.ok(measured.emailLabel.includes("wzh20010805@gmail.com"));
    assert.ok(measured.contactFits);
    assert.ok(measured.buttons.every((button) => button.height >= 48));
    assert.ok(measured.images.every((image) => image.loaded && image.alt));
    assert.ok(measured.hashLinks.every((link) => link.href !== "#" && link.targetExists));
    assert.deepEqual(measured.motions, []);
    assert.equal(measured.activeAnimations, 0);
    assert.equal(measured.scrollBehavior, "auto");
    assert.equal(measured.projectPreviewExists, false);

    await page.locator('.hero-actions a[href="#works"]').click();
    assert.equal(new URL(page.url()).hash, "#works");
    assert.ok(await page.locator("#works").evaluate((el) => el.getBoundingClientRect().top >= 0 && el.getBoundingClientRect().top < 100));
    await page.locator(".site-footer a").click();
    assert.equal(new URL(page.url()).hash, "#top");
    assert.equal(await page.evaluate(() => window.scrollY), 0);
    await page.screenshot({ path: fileURLToPath(new URL(`page-${width}.png`, output)), fullPage: true });
    await page.screenshot({ path: fileURLToPath(new URL(`first-screen-${width}.png`, output)), fullPage: false });
    assert.deepEqual(errors, []);
    assert.deepEqual(failedRequests, []);
    assert.deepEqual(externalRequests, []);
    results.viewports.push({ ...measured, anchorClicks: "passed", errors, failedRequests, externalRequests });
    console.log(`PASS ${width}px: layout, overflow, assets, category links, anchors, no motion or external requests`);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  for (const expected of ["跳到作品预览", "创作空间", "作品", "学习积累", "浏览作品", "查看作者 GitHub 主页", "邮箱联系我", "我推荐的 Prompt", "我做的小工具", "我做的小游戏", "我做的 Skill", "我做的 Agent", "我的学习与技术积累", "回到顶部"]) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      const style = getComputedStyle(el);
      return { text: el.textContent, tag: el.tagName, outline: style.outlineStyle, outlineWidth: style.outlineWidth, visible: el.getBoundingClientRect().top >= 0 && el.getBoundingClientRect().top < innerHeight };
    });
    assert.ok(focused.text.includes(expected), `Keyboard focus should reach ${expected}, got ${focused.text}`);
    assert.notEqual(focused.outline, "none");
    assert.ok(parseFloat(focused.outlineWidth) >= 3 && focused.visible);
    results.keyboard.push(focused);
  }
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#works");
  await page.close();
  await writeFile(new URL("browser-results.json", output), JSON.stringify(results, null, 2) + "\n");
  console.log("PASS keyboard: navigation, GitHub, email and category cards have visible focus; Enter activates skip link");
} finally {
  await browser.close();
}
