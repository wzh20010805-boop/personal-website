import { mkdir, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const baseURL = (process.env.CHECK_URL ?? "http://127.0.0.1:4173").replace(/\/$/, "");
const screenshotOutput = process.env.CHECK_OUTPUT_DIR
  ? pathToFileURL(resolve(process.env.CHECK_OUTPUT_DIR) + sep)
  : new URL("../docs/checks/category-upgrade/", import.meta.url);
await mkdir(screenshotOutput, { recursive: true });
const categories = [
  ["prompts", "我推荐的 Prompt", "0"],
  ["tools", "我做的小工具", "1"],
  ["games", "我做的小游戏", "0"],
  ["skills", "我做的 Skill", "1"],
  ["agents", "我做的 Agent", "0"],
  ["learning", "我的学习与技术积累", "0"],
];
const detailPath = "/tools/pixel-cursor/";
const projectTitle = "像素光标 · Pixel Cursor";
const screenshotPath = "/images/tools/pixel-cursor-overview.png";
const runtimeErrors = [];
const failedResources = [];
const layoutChecks = [];
const imageChecks = [];

function verify(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("requestfailed", (request) => failedResources.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
  page.on("response", (response) => {
    if (response.status() >= 400 && new URL(response.url()).pathname !== "/favicon.ico") {
      failedResources.push(`${response.status()} ${response.url()}`);
    }
  });

  async function visit(path) {
    const response = await page.goto(`${baseURL}${path}`, { waitUntil: "networkidle" });
    verify(response?.ok(), `${path} 直接访问失败：${response?.status() ?? "无响应"}`);
  }

  async function clickAndCheck(link, path) {
    await link.click();
    await page.waitForURL(`${baseURL}${path}`);
    await page.waitForLoadState("networkidle");
  }

  async function checkScreenshot(selector, route, width) {
    const image = page.locator(selector);
    verify((await image.count()) === 1, `${route} 应显示一张真实截图`);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
    const measured = await image.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const parentBox = element.parentElement.getBoundingClientRect();
      return {
        src: new URL(element.currentSrc).pathname,
        alt: element.alt,
        complete: element.complete,
        naturalWidth: element.naturalWidth,
        naturalHeight: element.naturalHeight,
        objectFit: getComputedStyle(element).objectFit,
        width: box.width,
        height: box.height,
        withinContainer: box.left >= parentBox.left - 1 && box.right <= parentBox.right + 1 && box.top >= parentBox.top - 1 && box.bottom <= parentBox.bottom + 1,
      };
    });
    verify(measured.src === screenshotPath, `${route} 截图不是用户提供的本地素材`);
    verify(measured.complete && measured.naturalWidth === 1246 && measured.naturalHeight === 863, `${route} 截图未加载或原始尺寸不正确`);
    verify(measured.alt.trim().length > 0, `${route} 截图缺少替代文字`);
    verify(measured.objectFit === "contain" && measured.withinContainer && measured.width > 0 && measured.height > 0, `${route} 截图未完整显示`);
    imageChecks.push({ route, width, ...measured });
  }

  await visit("/");
  verify((await page.locator("a.category-card").count()) === categories.length, "首页应有六张整卡分类链接");
  const toolsCardText = await page.locator("a.category-card[href='/tools/']").innerText();
  verify(/1\s*件作品/.test(toolsCardText), "首页小工具卡片应显示 1 件作品");

  for (const [slug, title, count] of categories) {
    await visit("/");
    await clickAndCheck(page.locator(`a.category-card[href='/${slug}/']`), `/${slug}/`);
    verify((await page.locator("h1").innerText()).trim() === title, `首页 ${slug} 卡片未进入正确分类`);

    await visit(`/${slug}/`);
    verify((await page.locator("main#content").count()) === 1, `/${slug}/ 缺少 main#content`);
    verify((await page.locator("h1").count()) === 1, `/${slug}/ 应有唯一 h1`);
    verify((await page.locator("h1").innerText()).trim() === title, `/${slug}/ 标题不正确`);
    const reloadResponse = await page.reload({ waitUntil: "networkidle" });
    verify(reloadResponse?.ok() && (await page.locator("h1").innerText()).trim() === title, `/${slug}/ 刷新失败`);
    verify((await page.locator("[data-published-count]").getAttribute("data-published-count")) === count, `/${slug}/ 已发布内容数量不正确`);
    verify((await page.locator(".breadcrumb a[href='/']").count()) === 1, `/${slug}/ 缺少首页面包屑`);
    verify((await page.locator(".site-brand").getAttribute("href")) === "/", `/${slug}/ 品牌首页链接不正确`);
    verify((await page.getByRole("link", { name: "作品", exact: true }).getAttribute("href")) === "/#works", `/${slug}/ 作品导航不正确`);
    verify((await page.getByRole("link", { name: "学习积累", exact: true }).getAttribute("href")) === "/learning/", `/${slug}/ 学习导航不正确`);
    if (count === "0") {
      const emptyState = page.locator(".empty-state");
      verify((await emptyState.count()) === 1, `/${slug}/ 缺少完整空状态`);
      verify((await emptyState.innerText()).includes("这个抽屉正在整理中。") && (await emptyState.innerText()).includes("有准备好的内容后，会放在这里。"), `/${slug}/ 空状态文案不完整`);
    }
    await clickAndCheck(page.getByRole("link", { name: "返回首页作品区" }), "/#works");
    verify(await page.locator("#works").isVisible(), `/${slug}/ 返回作品区失败`);
  }

  await visit("/tools/");
  const projectCard = page.locator(`.project-grid > a.project-card[href='${detailPath}']`);
  verify((await page.locator(".project-grid > a.project-card").count()) === 1, "工具列表应展示一张已发布作品卡片");
  verify((await projectCard.count()) === 1, "工具卡片应整卡链接至像素光标详情页");
  verify((await projectCard.getByRole("heading", { level: 2, name: projectTitle, exact: true }).count()) === 1, "工具卡片缺少正确的作品标题");
  verify((await projectCard.locator("a, button, input, select, textarea").count()) === 0, "整卡链接内不应嵌套其他交互控件");
  verify((await page.locator(".tool-project").count()) === 0, "工具列表仍显示完整详情内容");
  await clickAndCheck(projectCard, detailPath);
  verify((await page.locator("h1").innerText()).trim() === projectTitle, "点击工具卡片没有进入详情页");

  await visit(detailPath);
  verify((await page.locator("main#content.tool-detail-page").count()) === 1, "详情页缺少可跳转的主要内容区域");
  verify((await page.locator("h1").count()) === 1 && (await page.locator(".tool-project h1").innerText()).trim() === projectTitle, "详情页应以作品标题为唯一 h1");
  for (const heading of ["能做什么", "怎么使用", "下载前须知"]) {
    verify((await page.getByRole("heading", { level: 2, name: heading, exact: true }).count()) === 1, `详情页缺少 ${heading}`);
  }
  const detailReload = await page.reload({ waitUntil: "networkidle" });
  verify(detailReload?.ok() && (await page.locator("h1").innerText()).trim() === projectTitle, "详情页刷新失败");
  verify((await page.locator(".breadcrumb a[href='/']").count()) === 1 && (await page.locator(".breadcrumb a[href='/tools/']").count()) === 1, "详情页面包屑缺少首页或小工具列表入口");
  verify((await page.locator(".breadcrumb [aria-current='page']").innerText()).includes("像素光标"), "详情页面包屑缺少当前作品名");

  const externalLinks = page.locator(".tool-project__actions a");
  const externalHrefs = await externalLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  verify(JSON.stringify(externalHrefs) === JSON.stringify([
    "https://github.com/wzh20010805-boop/pointer-tool/releases/latest",
    "https://github.com/wzh20010805-boop/pointer-tool",
  ]), "像素光标下载与源码链接目标不正确");
  for (const link of await externalLinks.all()) {
    const rel = ((await link.getAttribute("rel")) ?? "").split(/\s+/);
    verify((await link.getAttribute("target")) === "_blank" && rel.includes("noopener") && rel.includes("noreferrer"), "详情外链缺少新标签页和安全 rel 设置");
    verify((await link.innerText()).includes("新标签页打开"), "详情外链缺少新标签页提示");
  }

  await clickAndCheck(page.locator(".back-to-works[href='/tools/']"), "/tools/");
  await projectCard.focus();
  await page.keyboard.press("Enter");
  await page.waitForURL(`${baseURL}${detailPath}`);
  await clickAndCheck(page.locator(".breadcrumb a[href='/tools/']"), "/tools/");
  await clickAndCheck(projectCard, detailPath);
  await clickAndCheck(page.locator(".breadcrumb a[href='/']"), "/");
  await visit(detailPath);
  await clickAndCheck(page.locator(".site-brand"), "/");
  await visit(detailPath);
  await clickAndCheck(page.getByRole("link", { name: "作品", exact: true }), "/#works");
  await visit(detailPath);
  await clickAndCheck(page.getByRole("link", { name: "学习积累", exact: true }), "/learning/");

  const routes = ["/", ...categories.map(([slug]) => `/${slug}/`), detailPath];
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await visit(route);
      if (route === "/tools/") await checkScreenshot(".project-card__cover img", route, width);
      if (route === detailPath) await checkScreenshot(".tool-project__visual img", route, width);
      const measured = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        motions: [...document.querySelectorAll("body *")].filter((element) => {
          const style = getComputedStyle(element);
          return style.animationName !== "none" || style.transitionDuration.split(",").some((duration) => parseFloat(duration) > 0);
        }).length,
        smoothScroll: getComputedStyle(document.documentElement).scrollBehavior === "smooth",
        brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length,
      }));
      verify(measured.documentWidth <= measured.viewportWidth, `${route} 在 ${width}px 出现横向溢出`);
      verify(measured.motions === 0 && !measured.smoothScroll, `${route} 在 ${width}px 检测到动画、过渡或平滑滚动`);
      verify(measured.brokenImages === 0, `${route} 在 ${width}px 存在加载失败的图片`);
      layoutChecks.push({ route, width, ...measured });
      if ([375, 1440].includes(width) && ["/tools/", "/prompts/", detailPath].includes(route)) {
        const name = route === detailPath ? "pixel-cursor" : route.replaceAll("/", "");
        await page.screenshot({ path: fileURLToPath(new URL(`${name}-${width}.png`, screenshotOutput)), fullPage: true });
      }
    }
  }

  verify(runtimeErrors.length === 0, `浏览器运行错误：${runtimeErrors.join("；")}`);
  verify(failedResources.length === 0, `页面资源请求失败：${failedResources.join("；")}`);
  await writeFile(new URL("content-results.json", screenshotOutput), `${JSON.stringify({
    baseURL,
    checkedAt: new Date().toISOString(),
    routes,
    categoryLinks: 6,
    emptyCategories: 4,
    publishedSkills: 1,
    publishedTools: 1,
    detailPath,
    externalHrefs,
    externalLinkNetworkCheck: "未在此脚本访问外站；仅核对精确目标、target 和 rel。",
    runtimeErrors,
    failedResources,
    imageChecks,
    layoutChecks,
  }, null, 2)}\n`, "utf8");
  console.log(`内容页检查通过：六分类入口与四个空状态、工具列表与详情点击/刷新/返回、真实截图加载与完整比例、外链配置、四种屏宽布局、无动画及无运行错误。截图和检查 JSON 已写入 ${fileURLToPath(screenshotOutput)}。`);
} finally {
  await browser.close();
}
