import type { CategoryId } from "./categories";

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  visibility?: "private" | "public";
  typeLabel?: string;
  detailLabel?: string;
  coverCaption?: string;
  category: CategoryId;
  description: string;
  motivation?: string[];
  status: string;
  cover: { src: string; alt: string; width: number; height: number } | null;
  detailHref: string;
  links: { href: string; label: string }[];
  isPlaceholder: boolean;
  published: boolean;
  sourceVersion: string;
  requirements: string[];
  delivery: string;
  features: string[];
  cursorPreviewCaption?: string;
  cursorStates?: {
    id: string;
    title: string;
    description: string;
    viewBox: string;
  }[];
  steps: string[];
  notice: string;
}

export const projects: Project[] = [{
  id: "pixel-cursor",
  title: "像素光标 · Pixel Cursor",
  category: "tools",
  description: "为 Windows 换上一套像素风鼠标光标，先预览效果，再选择尺寸并应用主题。",
  motivation: [
    "最近，网上那条“吃白饭的蓝色大肥鱼”火了。它是与 DeepSeek 相关的非官方二创形象，我也非常喜欢。",
    "看到 GitHub 上已经有人把它做成桌宠，让它融入日常生活、学习和工作，陪伴我们，我也冒出了一个想法：能不能做一个大肥鱼的鼠标指针？",
    "抱着这个想法，我开始尝试，于是就有了现在这款修改鼠标指针的工具——像素光标 · Pixel Cursor。",
  ],
  status: "Windows 便携工具",
  cover: {
    src: "/images/tools/pixel-cursor-overview.png",
    alt: "像素光标软件真实界面：光标主题状态预览、尺寸选择、应用主题与恢复方案按钮",
    width: 1246,
    height: 863,
  },
  detailHref: "/tools/pixel-cursor/",
  links: [
    { href: "https://github.com/wzh20010805-boop/pointer-tool/releases/latest", label: "前往 GitHub 下载" },
    { href: "https://github.com/wzh20010805-boop/pointer-tool", label: "查看源码与说明" },
  ],
  isPlaceholder: false,
  published: true,
  sourceVersion: "v0.1.1",
  requirements: ["Windows 10 / 11", ".NET Framework 4.8"],
  delivery: "Windows 便携包；完整解压后运行 PixelCursor.exe。",
  features: [
    "先预览，再决定：查看普通选择、文本选择、链接选择和后台运行等状态，点击状态卡片后，还能在右侧放大预览区看清光标的形状与细节。",
    "选择顺眼的尺寸：提供 32、48、64 像素三档大小，配合“尺寸预览”对比效果。选好主题和尺寸后，再点击“应用这个主题”。",
    "在程序里试一试：内置文字、链接和可拖动边缘的测试区域，可以体验选中文字、指向链接、调整边缘等日常操作时的光标效果。",
    "应用主题，也能恢复：手动应用后，会更改当前用户的 Windows 光标方案。需要换回时，可以选择“恢复原方案”，或“恢复 Windows 默认”；关闭程序不会自动恢复。",
  ],
  cursorPreviewCaption: "以下选取软件截图中蓝发角色主题的四个常见状态，展示为静态画面。",
  cursorStates: [
    { id: "normal", title: "普通选择", description: "日常指向按钮、图标和其他可选择项目时使用。", viewBox: "298 224 56 56" },
    { id: "text", title: "文本选择", description: "在可编辑或可选中的文字区域，帮助定位文字。", viewBox: "430 224 56 56" },
    { id: "link", title: "链接选择", description: "指向可点击的链接时，提示这里可以打开。", viewBox: "563 224 56 56" },
    { id: "working", title: "后台运行", description: "程序正在处理任务时使用的状态；这里展示截图中的一帧。", viewBox: "430 591 56 56" },
  ],
  steps: [
    "前往 GitHub 发布页，选择适合的 Windows 工具包。",
    "完整解压压缩包，保留文件夹中的配套资源。",
    "运行 PixelCursor.exe，选择主题和尺寸后点击“应用这个主题”。",
  ],
  notice: "本工具会修改当前用户的 Windows 光标方案。关闭程序不会自动撤销已应用的主题，需要恢复时请使用恢复功能。当前展示版本未进行代码签名，Windows 可能提示未知发布者。不同系统版本、缩放设置及软件自身的光标行为可能影响效果；详细说明以仓库 README 和发布页为准。",
}, {
  id: "amazon-product-radar",
  title: "Amazon Product Radar",
  subtitle: "Amazon 选品机会雷达",
  visibility: "private",
  typeLabel: "AI SKILL",
  detailLabel: "查看项目详情",
  coverCaption: "真实历史报告 · 2026-09-14",
  category: "skills",
  description: "一个面向 Amazon 选品决策的机会发现 Skill，从真实商品与证据出发，对候选机会进行推荐理由、评分、风险和信息来源分析，帮助快速判断哪些产品值得进一步研究。",
  status: "PRIVATE PROJECT",
  cover: {
    src: "/images/skills/amazon-product-radar/report-overview.png",
    alt: "Amazon Product Radar 真实历史报告总览：2026 年 9 月 14 日的 JP 市场、2 个类目、4 个合格机会与 11 个校验候选",
    width: 1009,
    height: 505,
  },
  detailHref: "/skills/amazon-product-radar/",
  links: [],
  isPlaceholder: false,
  published: true,
  sourceVersion: "",
  requirements: [],
  delivery: "",
  features: [],
  steps: [],
  notice: "私人项目 · 源码暂不公开",
}];

export function getPublishedProjectsByCategory(category: CategoryId) {
  return projects.filter((project) => project.category === category && project.published && !project.isPlaceholder);
}
