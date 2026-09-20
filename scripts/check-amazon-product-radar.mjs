import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseURL = (process.env.CHECK_URL ?? "http://127.0.0.1:4174").replace(/\/$/, "");
const outputDirectory = resolve(
  process.env.CHECK_AMAZON_OUTPUT_DIR ?? process.env.CHECK_OUTPUT_DIR
    ?? join(projectRoot, "docs/checks/amazon-product-radar"),
);
const listPath = "/skills/";
const detailPath = "/skills/amazon-product-radar/";
const imageDirectory = "/images/skills/amazon-product-radar/";
const expectedImages = [
  "report-overview",
  "product-opportunity-card",
  "recommendation-score",
  "risk-analysis",
  "evidence-sources",
  "recommendation-reasons",
];
const report = {
  baseURL,
  checkedAt: new Date().toISOString(),
  status: "running",
  routes: [listPath, detailPath],
  navigationChecks: [],
  imageChecks: [],
  servedImageChecks: [],
  privacyChecks: [],
  layoutChecks: [],
  runtimeErrors: [],
  failedResources: [],
  externalRequests: [],
};
await mkdir(outputDirectory, { recursive: true });

function verify(condition, message) {
  if (!condition) throw new Error(message);
}

function imageName(src) {
  return src.slice(imageDirectory.length).replace(/^\d{2}-/, "").replace(/\.png$/, "");
}

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", (error) => report.runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.location().url?.endsWith("/favicon.ico")) {
      report.runtimeErrors.push(message.text());
    }
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (["http:", "https:"].includes(url.protocol) && url.origin !== new URL(baseURL).origin) {
      report.externalRequests.push(request.url());
    }
  });
  page.on("requestfailed", (request) => {
    report.failedResources.push(request.method() + " " + request.url() + ": " + request.failure()?.errorText);
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && new URL(response.url()).pathname !== "/favicon.ico") {
      report.failedResources.push(response.status() + " " + response.url());
    }
  });

  async function visit(route) {
    const response = await page.goto(baseURL + route, { waitUntil: "networkidle" });
    verify(response?.ok(), route + " 直接访问失败：" + (response?.status() ?? "无响应"));
  }

  async function navigate(link, route, method = "click") {
    if (method === "keyboard") {
      await link.focus();
      await page.keyboard.press("Enter");
    } else {
      await link.click();
    }
    await page.waitForURL(baseURL + route);
    await page.waitForLoadState("networkidle");
    report.navigationChecks.push({ method, destination: route });
  }

  async function checkPrivacy(route) {
    const links = await page.getByRole("link").evaluateAll((elements) => elements.map((element) => ({
      href: element.getAttribute("href") ?? "",
      text: (element.textContent ?? "").trim(),
      accessibleName: element.getAttribute("aria-label") ?? "",
      download: element.hasAttribute("download"),
    })));
    for (const link of links) {
      const target = new URL(link.href, baseURL);
      verify(target.origin === new URL(baseURL).origin, route + " 出现站外或私有入口：" + link.href);
      verify(!/github|download|install|查看源码|下载|安装|源代码/i.test(link.text + " " + link.accessibleName + " " + link.href),
        route + " 出现源码、仓库、下载或安装入口");
      verify(!link.download, route + " 不应有文件下载入口");
      verify(!target.pathname.startsWith(detailPath) || target.pathname === detailPath,
        route + " 不应新增第四级页面入口");
    }
    const text = await page.locator("main").innerText();
    verify(!/[A-Za-z]:[\\/]|file:\/\/|\/Users\/|\/home\/|\\\\[A-Za-z0-9.-]+\\/.test(text),
      route + " 出现本地或私有文件路径");
    verify(!/(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|(?:api[_-]?key|access[_-]?token|password|cookie)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{12,})/i.test(text),
      route + " 出现疑似密钥或凭证");
    verify(await page.locator("main button, main input, main select, main textarea, main iframe, main video").count() === 0,
      route + " 应保持静态作品展示，不应出现运行、登录或复杂交互控件");
    report.privacyChecks.push({ route, links, localPaths: 0, credentialPatterns: 0 });
  }

  const verifiedFiles = new Map();
  async function checkImages(route, width) {
    const images = page.locator(route === listPath ? "a.project-card img" : "main img");
    const expectedCount = route === listPath ? 1 : 6;
    verify(await images.count() === expectedCount, route + " 应显示 " + expectedCount + " 张真实截图");
    const names = [];
    const alts = [];
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((element) => element.decode());
      const measured = await image.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const parent = element.parentElement.getBoundingClientRect();
        const style = getComputedStyle(element);
        const horizontalInsets = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth)
          + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const verticalInsets = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
          + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        return {
          src: element.getAttribute("src"),
          currentSrc: element.currentSrc,
          alt: element.alt,
          naturalWidth: element.naturalWidth,
          naturalHeight: element.naturalHeight,
          width: box.width - horizontalInsets,
          height: box.height - verticalInsets,
          borderBoxWidth: box.width,
          borderBoxHeight: box.height,
          complete: element.complete,
          objectFit: style.objectFit,
          withinContainer: box.left >= parent.left - 1 && box.right <= parent.right + 1
            && box.top >= parent.top - 1 && box.bottom <= parent.bottom + 1,
        };
      });
      verify(measured.src?.startsWith(imageDirectory) && measured.src.endsWith(".png"),
        route + " 截图必须直接使用本地 PNG 原图");
      verify(new URL(measured.currentSrc).origin === new URL(baseURL).origin
        && new URL(measured.currentSrc).pathname === measured.src
        && !new URL(measured.currentSrc).search, route + " 截图不应经外部图床或图像转换服务加载");
      const name = imageName(measured.src);
      names.push(name);
      alts.push(measured.alt);
      verify(expectedImages.includes(name), route + " 出现非任务包截图：" + name);
      verify(measured.alt.trim().length >= 6, route + " 截图缺少有意义的 alt");
      verify(measured.complete && measured.naturalWidth > 0 && measured.naturalHeight > 0
        && measured.width > 0 && measured.height > 0, route + " 截图加载失败");
      verify(measured.objectFit === "contain" && measured.withinContainer, route + " 截图应完整显示且不被容器裁切");
      const aspectError = Math.abs((measured.width / measured.height)
        / (measured.naturalWidth / measured.naturalHeight) - 1);
      verify(aspectError < 0.005, route + " 截图没有保持原始宽高比");
      if (!verifiedFiles.has(measured.src)) {
        const bytes = await readFile(join(projectRoot, "public", measured.src.slice(1)));
        verify(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), "本地素材不是 PNG");
        verify(bytes.readUInt32BE(16) === measured.naturalWidth && bytes.readUInt32BE(20) === measured.naturalHeight,
          route + " 浏览器图片尺寸与本地原始素材不一致");
        const response = await page.request.get(baseURL + measured.src);
        verify(response.ok(), "静态截图 URL 访问失败：" + measured.src);
        const sha256 = createHash("sha256").update(bytes).digest("hex");
        verify(createHash("sha256").update(await response.body()).digest("hex") === sha256,
          "HTTP 返回图片与 public 原始素材不一致：" + measured.src);
        verifiedFiles.set(measured.src, sha256);
        report.servedImageChecks.push({ src: measured.src, sha256, bytes: bytes.length });
      }
      report.imageChecks.push({ route, viewportWidth: width, aspectError, ...measured });
    }
    verify(new Set(alts).size === expectedCount, route + " 每张截图应有各自准确的 alt");
    verify(route === listPath ? names[0] === "report-overview"
      : expectedImages.every((name) => names.includes(name)) && new Set(names).size === 6,
    route + " 截图集合不完整或列表未使用报告总览");
  }

  await visit(listPath);
  verify(await page.getByRole("heading", { level: 1, name: "我做的 Skill", exact: true }).count() === 1,
    "Skill 列表标题不正确");
  verify(await page.locator("a.project-card").count() === 1, "Skill 列表应只有一张正式作品卡");
  const card = page.locator("a.project-card[href='" + detailPath + "']");
  verify(await card.count() === 1, "Skill 作品卡应链接至三级详情页");
  verify(/Amazon\s+Product\s+Radar/.test(await card.innerText()), "Skill 卡片缺少项目名称");
  verify(/Amazon 选品机会雷达/.test(await card.innerText()), "Skill 卡片缺少中文名称");
  verify(/PRIVATE PROJECT/.test(await card.innerText()) && /AI SKILL/.test(await card.innerText()),
    "Skill 卡片缺少项目身份与类型");
  verify(/查看项目详情/.test(await card.innerText()), "Skill 卡片缺少明确的详情操作文案");
  verify(await card.locator("a, button, input, select, textarea").count() === 0, "整卡链接不能嵌套交互控件");
  verify(await page.locator(".empty-state").count() === 0, "Skill 列表仍显示空状态");
  await checkPrivacy(listPath);
  await navigate(card, detailPath);

  await visit(detailPath);
  verify(await page.locator("main#content").count() === 1, "详情页缺少可跳转的主要内容区域");
  verify(await page.getByRole("heading", { level: 1 }).count() === 1
    && /Amazon\s+Product\s+Radar/.test(await page.getByRole("heading", { level: 1 }).innerText()),
  "详情页应以 Amazon Product Radar 为唯一主标题");
  const reloadResponse = await page.reload({ waitUntil: "networkidle" });
  verify(reloadResponse?.ok() && /Amazon\s+Product\s+Radar/.test(await page.locator("h1").innerText()), "详情页刷新失败");
  report.navigationChecks.push({ method: "direct-and-reload", destination: detailPath });
  const detailText = (await page.locator("main").innerText()).replace(/\s+/g, " ");
  for (const [description, expression] of [
    ["历史案例和原始报告日期", /历史[\s\S]*2026-09-14|2026-09-14[\s\S]*历史/],
    ["非实时推荐说明", /不代表当前实时选品推荐/],
    ["示例报告数据标签", /示例报告数据/],
    ["AI 判断限定", /AI ESTIMATE|AI 判断/],
    ["L3 候选与验证要求", /L3[\s\S]*材料[\s\S]*生命周期[\s\S]*不宜直接下单/],
    ["需求机会评分对象", /评分对象[\s\S]*需求机会/],
    ["分数不代表质量、星级或成功概率", /不等同于[\s\S]*商品质量[\s\S]*Amazon 星级[\s\S]*成功概率/],
    ["未知风险说明", /未评估不代表低风险/],
    ["风险扫描保留人工判断", /风险扫描[\s\S]*不自动[\s\S]*淘汰商品/],
    ["源码和仓库不公开", /源码[\s\S]*(?:仓库[\s\S]*不公开|不公开)/],
    ["总机会评分", /32\.18\s*\/\s*100/],
    ["证据置信系数", /70\s*%/],
    ["异常信号分值", /21\.5\s*\/\s*40/],
    ["商业价值分值", /28\.9\s*\/\s*45/],
    ["国内采购分值", /7\s*\/\s*15/],
  ]) {
    verify(expression.test(detailText), "详情页缺少" + description);
  }
  await checkPrivacy(detailPath);

  await navigate(page.locator("main a[href='/skills/']").last(), listPath);
  await navigate(card, detailPath, "keyboard");
  await navigate(page.locator("main a[href='/']").first(), "/");
  await visit(detailPath);
  const homeOrWorks = page.locator("main a[href='/#works']");
  if (await homeOrWorks.count()) await navigate(homeOrWorks.first(), "/#works");
  await visit(detailPath);
  await navigate(page.locator("main a[href='/skills/']").first(), listPath);

  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [listPath, detailPath]) {
      await visit(route);
      await checkImages(route, width);
      const measured = await page.evaluate(() => {
        const elements = [...document.querySelectorAll("body *")];
        const hasMotion = (element) => {
          const style = getComputedStyle(element);
          return style.animationName !== "none"
            || style.transitionDuration.split(",").some((value) => parseFloat(value) > 0);
        };
        return {
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
          motions: elements.filter(hasMotion).length,
          smoothScroll: getComputedStyle(document.documentElement).scrollBehavior === "smooth",
          brokenImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth).length,
        };
      });
      verify(measured.documentWidth <= measured.viewportWidth, route + " 在 " + width + "px 出现横向溢出");
      verify(measured.motions === 0 && !measured.smoothScroll, route + " 不应新增动画、过渡或平滑滚动");
      verify(measured.brokenImages === 0, route + " 存在未加载的图片");
      report.layoutChecks.push({ route, width, ...measured });
      if ([375, 1440].includes(width)) {
        const name = route === listPath ? "skills" : "amazon-product-radar";
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: join(outputDirectory, name + "-" + width + ".png"), fullPage: true });
        if (route === detailPath) {
          await page.screenshot({ path: join(outputDirectory, name + "-hero-" + width + ".png") });
          const firstImage = page.locator("main img").first();
          const frame = firstImage.locator("xpath=ancestor::figure[1]");
          await (await frame.count() ? frame : firstImage).screenshot({
            path: join(outputDirectory, name + "-case-" + width + ".png"),
          });
        }
      }
    }
  }

  verify(report.runtimeErrors.length === 0, "浏览器运行错误：" + report.runtimeErrors.join("；"));
  verify(report.failedResources.length === 0, "页面资源请求失败：" + report.failedResources.join("；"));
  verify(report.externalRequests.length === 0, "展示页出现站外请求：" + report.externalRequests.join("；"));
  report.status = "passed";
  console.log("Amazon Product Radar 验收通过：列表与详情导航、六张原图及 alt/比例、历史与风险说明、私有项目入口检查、四种宽度、无动画和浏览器错误。");
  console.log("截图与 JSON：" + outputDirectory);
} catch (error) {
  report.status = "failed";
  report.failure = error.message;
  throw error;
} finally {
  await writeFile(join(outputDirectory, "amazon-product-radar-results.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  await browser.close();
}
