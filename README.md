# 创作空间 · 个人作品展厅

使用 Next.js 静态导出的个人网页，保留糖果色、深橄榄绿描边、手绘图形、漫画网点和纸张颗粒。首页有可交互 Three.js 创作角与 Live2D 伙伴；场景支持减少动态偏好。

首页提供六个分类入口；小工具、游戏、Skill 和 Agent 分类通过作品卡片进入独立详情页，其他两个分类显示完整空状态。当前作品包含像素光标、Sprite Motion Studio、个人知识库、Colony Roads · 微境节点战争和 Amazon Product Radar。

## 在线访问与自动发布

公开网页：[创作空间](https://wzh20010805-boop.github.io/personal-website/)。

GitHub Pages 使用 `.github/workflows/deploy-pages.yml` 构建并发布。推送到 `main` 后自动执行依赖安装、lint、typecheck、静态构建和部署；也可在 Actions 中手动运行。部署源码和内容使用同一仓库，无需提交 `out/`。

发布时设置 `NEXT_PUBLIC_BASE_PATH=/personal-website`，供 Next.js 路由和 `lib/public-assets.ts` 中的图片、原图及纸纹资源使用。本地不设置该变量，仍可在根路径预览。仓库 Settings → Pages 的构建来源为 GitHub Actions。公开地址是否已经更新，以最新发布工作流和公网检查为准。

发布后运行 `node scripts/check-public-site.mjs`，检查公开网页的十条路由、手机与桌面布局、图片和纸纹资源、原图链接及页面导航。可通过 `CHECK_URL` 指向带仓库路径的本地预览进行发布前验证。

## 本地运行

需要 Node.js 24 或更高版本，依赖版本由 `package-lock.json` 固定。

```powershell
cd personal-website
npm ci
npm run dev
```

开发服务绑定本机，默认地址为 `http://127.0.0.1:3000`，实际端口以终端输出为准。停止服务使用对应终端的 `Ctrl+C`。

Windows 无窗口启动：安装依赖后双击项目根目录的 `start-local.vbs`，后台服务使用 `http://127.0.0.1:3010/`，重复启动复用已有服务。日志位于 `output/local-server/`。普通终端也可运行 `npm run dev -- --port 3010`（先确保后台服务未占用该端口）。

### 首页 3D 创作角

沿用 Three.js 0.186.1，以程序化曲面生成完整猫咪、黄色沙发和道具，无外部模型下载。`lib/creator-scene-model.ts` 管理角色和沙发；`lib/creator-scene-props.ts` 管理六个独立入口；`lib/creator-scene-kit.ts` 提供共享材质、曲线与静态合批；`lib/creator-scene.ts` 管理灯光、相机、命中和资源清理。

拖动旋转，使用加减按钮缩放、复位按钮恢复视角。画布获得键盘焦点后，方向键旋转、加减号缩放、Home 复位；六个文字入口支持 Tab 和 Enter。入口连接项目已有六类页面，其中 Prompt 与学习笔记保留现有空状态。无法使用 WebGL 时显示原插画和可点击标签。

展开场景下方的“六视图检查”，可切换正面、左侧、右侧、背面、顶部和底部的等比例正交视角。检查时保持角色姿态和道具位置不变，入口链接集中在下方；拖动或按方向键恢复自由观察。实心粉色背板在背面会正常遮挡主体，可取消“显示粉色背板”检查猫咪、沙发及道具背部。双前脚、笔电转轴与键盘、圆形底座和四个底部脚垫使用同一套三维结构，不按视角搬动物件。

温暖主光、冷色补光与轮廓光搭配织物、毛色、纸张、塑料、金属和陶瓷材质；彩色贴图使用 sRGB，数据贴图保持线性，最终由渲染器执行一次 ACES 与输出转换。像素比上限 1.75，角色轻微呼吸和眨眼最多 30Hz；离屏或后台暂停，减少动态偏好下静止。运动使阴影重新更新，相机单独运动复用阴影缓存。六个入口和可动角色保留独立控制身份。

制作方法研究了指定的 [GPT-6 Astra 源码](https://github.com/ptsfdtz/711-night/blob/master/gpt-6-astra/index.html)：采用层次化细节、局部描边、材质复用、主辅光与静态合批；本场景没有使用雨路反射或全屏 Bloom。

本地服务启动后运行 `npm run check:scene`，检查六个实体命中、键盘/指针操作、拖拽取消、重复激活、响应式布局与 WebGL 降级。实际全景、侧面、近景、入口状态和手机截图写入 `output/scene-refinement/`。

运行 `node scripts/check-creator-six-views.mjs`，检查六个相机轴向、模型位置不变、背板开关和恢复自由视角。六张实际渲染截图、六视图拼图及隐藏背板的背面截图写入 `output/six-view-checks/`；可用 `CHECK_URL` 指定服务地址，`PLAYWRIGHT_CHANNEL=msedge` 使用本机 Edge。

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
| `/tools/` | 小工具作品卡片列表，目前 2 件作品 |
| `/tools/pixel-cursor/` | 像素光标完整介绍、软件截图、功能、用法和下载须知 |
| `/tools/sprint-motion-studio/` | 素材创意工坊 v1.0.7 介绍、Windows 便携版下载、安装使用、实拍截图与后续验证 |
| `/agents/personal-knowledge/` | 个人知识库 Agent 介绍、DeepSeek API 说明、Archify 流程图与四张界面案例 |
| `/tools/personal-knowledge/` | 旧地址，自动转到 Agent 详情 |
| `/games/` | 游戏作品卡片列表，目前 1 件作品 |
| `/games/colony-roads/` | 微境节点战争的开发进度、制作流程原图与四张真实测试截图 |
| `/skills/` | Skill 作品卡片列表，目前 1 件作品 |
| `/skills/amazon-product-radar/` | Amazon Product Radar 私有 Skill 案例展示、工作流程与历史报告效果 |
| `/agents/` | Agent 作品列表，目前 1 件作品 |
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
| `app/tools/sprint-motion-studio/` | Sprint Motion Studio 详情页与独立 CSS Module |
| `app/agents/personal-knowledge/` | 个人知识库详情页与独立 CSS Module |
| `app/games/colony-roads/` | 游戏进度展示页与独立 CSS Module |
| `app/skills/page.tsx` | Skill 作品卡片列表 |
| `app/skills/amazon-product-radar/page.tsx` | Amazon Product Radar 静态案例详情页 |
| `components/` | 导航、分类、作品卡片、详情介绍和共享插画 |
| `app/globals.css` | 色板、纸纹、组件样式及响应式布局 |
| `public/illustrations/` | 本地 Hero 原图、保留的旧角色插画和纸张颗粒 SVG |
| `public/images/tools/` | 用户提供的真实工具截图 |
| `public/images/tools/sprint-motion-studio/` | v1.0.7 当前界面实拍、14帧透明输出、规则图集及动作预览文件 |
| `public/images/games/colony-roads/` | 作者提供的流程原图与游戏项目真实引擎测试截图 |
| `public/images/skills/amazon-product-radar/` | 用户提供的 Amazon Product Radar 历史报告截图 |

首页“查看作者 GitHub 主页”指向 `https://github.com/wzh20010805-boop`；按钮下方展示 `wzh20010805@gmail.com`，点击邮箱通过 `mailto:` 打开用户的邮件应用。作品自身的 GitHub 入口保持独立。首页右侧的 3D 创作角以用户提供的 `public/illustrations/creator-hero-v2.png` 原图（1312 × 1199，带透明通道）为美术依据；原图用于加载期间及 WebGL 不可用时的后备展示。“创作空间”为默认站名，没有填入未经确认的个人履历。

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
node scripts/check-game-showcase.mjs
node scripts/check-sprint-motion-studio.mjs
node scripts/check-personal-knowledge.mjs
```

`check:page` 检查首页布局、分类入口、作者 GitHub 主页、邮箱链接、锚点和键盘焦点。`check:content` 检查六分类实际跳转、两个空状态、工具卡片进入详情、独立访问和刷新、面包屑和返回导航、截图加载与完整显示、GitHub 链接配置，以及 320/375/768/1440px 下的溢出、动画和浏览器运行错误。`check-amazon-product-radar.mjs` 检查 Skill 卡片、三级详情导航、六张本地原图、历史案例与私有项目措辞，以及四种屏宽下的布局和站外请求。`check-game-showcase.mjs` 检查首页到游戏详情的完整导航、四张实况截图、流程原图打开与四种屏宽；结果写入 `docs/checks/game-showcase/`。外链真实网络可达性需单独检查，脚本不会把目标地址校验写成外站访问通过。

个人知识库资料来源见 `docs/personal-knowledge-showcase.md`。四张截图拍自隔离运行的真实应用，使用演示笔记与模拟模型输出，不包含私人资料。新增本地原有 Archify 交互流程图，说明 DeepSeek API 调用；旧工具地址转到 Agent 详情。项目源码当前私有，无公开安装包；详情页已标明访问方式和模型调用边界。`check-personal-knowledge.mjs` 检查四种屏宽、原图、导航和演示标注，结果写入 `docs/checks/personal-knowledge/`。

检查产物：

Sprint Motion Studio 的新增验收脚本检查两件工具的分类计数、实际卡片跳转与返回、原有像素光标导航、截图加载、原图打开以及 320/375/768/1440px 布局。截图和结果写入 `docs/checks/sprint-motion-studio/`；本地素材与资料来源见 `docs/sprint-motion-studio-showcase.md`。

- 首页截图与原始结果：`docs/checks/page-*.png`、`docs/checks/browser-results.json`。
- 小工具列表截图：`docs/checks/category-upgrade/tools-1440.png`、`tools-375.png`。
- 像素光标详情截图：`docs/checks/category-upgrade/pixel-cursor-1440.png`、`pixel-cursor-375.png`。
- 空状态截图和本轮原始检查结果：`docs/checks/category-upgrade/prompts-*.png`、`content-results.json`。

`docs/verification.md` 记录较早阶段的检查，不代表本轮结果；本轮以重新执行的终端结果与 `content-results.json` 为准。构建和自动检查通过后，仍需用户确认页面视觉效果。

## 工程边界

Next.js 16.3.5、React 19.3.0、TypeScript 5.9.3、Tailwind CSS 4.3.3；ESLint 使用 9.39.5。`.npmrc` 将缓存保存在项目的 `.npm-cache/`。Next.js 自动生成的 `AGENTS.md` 和 `CLAUDE.md` 保留当前版本的开发指导。

页面以静态 HTML/CSS/JS 运行，无业务后端、数据库、登录或在线工具执行功能。源码上传须在用户明确验收通过后另行执行。
