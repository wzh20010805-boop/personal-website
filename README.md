# 创作空间 · 个人作品展厅

使用 Next.js 静态导出的个人网页，保留糖果色、深橄榄绿粗描边、手绘 SVG、漫画网点和纸张颗粒。页面无动画。

首页提供六个分类入口；小工具和 Skill 分类通过作品卡片进入独立详情页，其他四个分类显示完整空状态。当前作品包含像素光标和 Amazon Product Radar。

## 本地运行

需要 Node.js 24 或更高版本，依赖版本由 `package-lock.json` 固定。

```powershell
cd personal-website
npm ci
npm run dev
```

开发服务绑定本机，默认地址为 `http://127.0.0.1:3000`，实际端口以终端输出为准。停止服务使用对应终端的 `Ctrl+C`。

生产构建与静态预览：

```powershell
npm run build
python -m http.server 4174 --bind 127.0.0.1 --directory out
```

在浏览器打开 `http://127.0.0.1:4174/`。静态服务命令需要 Python 3；也可以用其他 HTTP 服务托管 `out`。

`next.config.ts` 使用 `output: "export"`、`trailingSlash: true` 和 `images.unoptimized: true`。每条内容路由导出为对应目录内的 `index.html`，图片直接读取本地文件，不依赖 Next.js 图片服务。静态导出使用 HTTP 服务预览，不使用 `next start`。`out/`、`.next/`、依赖和缓存不提交到 Git。

## 页面与内容

| 路由 | 内容 |
| --- | --- |
| `/` | 首页、六张整卡分类入口 |
| `/prompts/` | Prompt 推荐空状态 |
| `/tools/` | 小工具作品卡片列表，目前 1 件作品 |
| `/tools/pixel-cursor/` | 像素光标完整介绍、软件截图、功能、用法和下载须知 |
| `/games/` | 小游戏空状态 |
| `/skills/` | Skill 作品卡片列表，目前 1 件作品 |
| `/skills/amazon-product-radar/` | Amazon Product Radar 私有 Skill 案例展示、工作流程与历史报告效果 |
| `/agents/` | Agent 空状态 |
| `/learning/` | 学习与技术积累空状态 |

像素光标介绍基于用户确认的 v0.1.1 资料。下载链接指向 [GitHub 发布页](https://github.com/wzh20010805-boop/pointer-tool/releases/latest)，源码与说明指向 [pointer-tool 仓库](https://github.com/wzh20010805-boop/pointer-tool)。这些链接是作品入口，本网页源代码仍属于 personal-website 项目。

`public/images/tools/pixel-cursor-overview.png` 来自用户提供的真实软件截图，原始尺寸 1246 × 863。列表和详情共用该图片，完整等比例展示，不裁掉软件界面。网页不包含工具程序或安装包，也没有添加许可证或商用授权声明。

`public/images/skills/amazon-product-radar/` 保存 Amazon Product Radar 的六张真实历史报告截图。页面将 2026-09-14 的内容明确标注为历史案例，不把评分、证据置信或 AI 判断描述为当前实时推荐；该私人项目不提供仓库、源码、下载或安装入口。

## 内容维护

| 文件或目录 | 用途 |
| --- | --- |
| `data/site.ts` | 站名、首页介绍、个人 GitHub 主页、联系邮箱和角色信息 |
| `data/categories.ts` | 六分类名称、路径、文案和颜色 |
| `data/projects.ts` | 真实作品资料、截图、详情路径和外部入口；分类数量由已发布的非占位作品计算 |
| `app/page.tsx` | 首页与 `#works` 作品区 |
| `app/tools/page.tsx` | 小工具卡片列表 |
| `app/tools/pixel-cursor/page.tsx` | 像素光标静态详情页 |
| `app/skills/page.tsx` | Skill 作品卡片列表 |
| `app/skills/amazon-product-radar/page.tsx` | Amazon Product Radar 静态案例详情页 |
| `components/` | 导航、分类、作品卡片、详情介绍和共享插画 |
| `app/globals.css` | 色板、纸纹、组件样式及响应式布局 |
| `public/illustrations/` | 本地 Hero 原图、保留的旧角色插画和纸张颗粒 SVG |
| `public/images/tools/` | 用户提供的真实工具截图 |
| `public/images/skills/amazon-product-radar/` | 用户提供的 Amazon Product Radar 历史报告截图 |

首页“查看作者 GitHub 主页”指向 `https://github.com/wzh20010805-boop`；按钮下方展示 `wzh20010805@gmail.com`，点击邮箱通过 `mailto:` 打开用户的邮件应用。作品自身的 GitHub 入口保持独立。首页右侧使用用户最新提供的 `public/illustrations/creator-hero-v2.png` 原图（1312 × 1199，带透明通道），完整等比例显示；上一版图片、旧场景组件与素材保留，但不再在 Hero 中渲染。“创作空间”为默认站名，没有填入未经确认的个人履历。

## 检查与截图

先执行项目已有检查与静态构建：

```powershell
npm run typecheck
npm run lint
npm run build
```

项目没有独立 `test` 脚本。浏览器验收脚本使用 Playwright；首次使用内置 Chromium 时运行 `npx playwright install chromium`，也可设置 `PLAYWRIGHT_CHANNEL=chrome` 使用本机 Chrome。

启动前述静态 HTTP 服务后，在另一个终端运行：

```powershell
$env:CHECK_URL = 'http://127.0.0.1:4174'
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run check:page
npm run check:content
node scripts/check-amazon-product-radar.mjs
```

`check:page` 检查首页布局、分类入口、作者 GitHub 主页、邮箱链接、锚点和键盘焦点。`check:content` 检查六分类实际跳转、四个空状态、工具卡片进入详情、独立访问和刷新、面包屑和返回导航、截图加载与完整显示、GitHub 链接配置，以及 320/375/768/1440px 下的溢出、动画和浏览器运行错误。`check-amazon-product-radar.mjs` 检查 Skill 卡片、三级详情导航、六张本地原图、历史案例与私有项目措辞，以及四种屏宽下的布局和站外请求。外链真实网络可达性需单独检查，脚本不会把目标地址校验写成外站访问通过。

检查产物：

- 首页截图与原始结果：`docs/checks/page-*.png`、`docs/checks/browser-results.json`。
- 小工具列表截图：`docs/checks/category-upgrade/tools-1440.png`、`tools-375.png`。
- 像素光标详情截图：`docs/checks/category-upgrade/pixel-cursor-1440.png`、`pixel-cursor-375.png`。
- 空状态截图和本轮原始检查结果：`docs/checks/category-upgrade/prompts-*.png`、`content-results.json`。

`docs/verification.md` 记录较早阶段的检查，不代表本轮结果；本轮以重新执行的终端结果与 `content-results.json` 为准。构建和自动检查通过后，仍需用户确认页面视觉效果。

## 工程边界

Next.js 16.3.5、React 19.3.0、TypeScript 5.9.3、Tailwind CSS 4.3.3；ESLint 使用 9.39.5。`.npmrc` 将缓存保存在项目的 `.npm-cache/`。Next.js 自动生成的 `AGENTS.md` 和 `CLAUDE.md` 保留当前版本的开发指导。

页面以静态 HTML/CSS/JS 运行，无业务后端、数据库、登录或在线工具执行功能。源码上传须在用户明确验收通过后另行执行。
