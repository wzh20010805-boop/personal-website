# 创作空间 · 第一阶段

独立创作者作品展厅的**静态视觉框架**，供本地视觉验收。暖米黄纸张、高饱和糖果色、深橄榄绿粗描边、硬阴影、手绘 SVG 插画和漫画网点。

已完成导航、Hero、独立猫咪角色槽位、六类预览、一张作品样式示例和页脚。第一阶段到此停止，等待视觉验收。

## 启动

需要 **Node.js 24 或更高版本**。本次环境为 Node.js 24.16.0、npm 11.13.0。

```powershell
cd D:\AIJOB\personal-web\personal-web-v0.1
npm install
npm run dev
```

已实际启动并检查的开发地址：**http://127.0.0.1:3000**。仅绑定本机；端口占用时以终端输出为准。关闭服务使用对应终端的 `Ctrl+C`。

生产构建与本地生产预览：

```powershell
npm run build
npm run start
```

若开发服务仍占用 3000，可使用 `npm run start -- --port 3001`。这只是本地预览，不会部署或上传文件。

## 修改内容

| 文件 | 用途 |
| --- | --- |
| `data/site.ts` | 站名、身份标签、主副标题、GitHub 地址、角色路径/alt/占位标志 |
| `data/categories.ts` | 六分类顺序、名称、文案、分类色引用 |
| `data/projects.ts` | 作品标题、封面、分类、简介、状态、可选链接与占位标志 |
| `app/globals.css` | 色板、中文系统字体、纹理、组件样式及响应式排布 |
| `app/layout.tsx` | 中文页面语言和元信息 |
| `app/page.tsx` | 单页组装及 `#works` 锚点；学习卡片提供 `#learning` |
| `components/` | 头尾、Hero、场景、角色、按钮、分类卡、作品卡及共享道具插画 |
| `public/illustrations/` | 实际使用的本地猫咪 SVG 和纸张颗粒 SVG |
| `scripts/check-page.mjs` | 浏览器验收和截图脚本 |
| `docs/checks/` | 真实页面截图及浏览器检查 JSON |

### 替换角色

将已确认可使用的新角色放入 `public/illustrations/`，修改 `data/site.ts` 的 `character.src`、`alt`，正式素材确认后设 `isPlaceholder: false`。推荐透明底、约 320:380 的画布比例；不同比例可调整 `CreatorCharacter.tsx` 尺寸及 `.creator-character`。无须重画工作台或六类道具。

### 补充 GitHub 和作品

- `githubUrl` 保持空字符串时输出禁用按钮及“GitHub 链接待补充”；填入已确认的真实地址后显示链接。
- 分类卡为静态展示，没有分类详情页或筛选。
- 作品 `cover`、`category`、`link` 可为 `null`。`link` 只有配置真实地址才输出链接；`cover` 缺失时显示 SVG 封面占位。
- 真实作品录入属于后续阶段；录入时区分原创、改编、第三方推荐并保留来源。当前没有真实作品数量或成果声明。

## 仍待替换的内容

- 蓝灰猫为本次自绘的临时 SVG，占位说明已显示；不是最终角色设计，也未使用来自网络的 Tom 猫素材。
- GitHub 地址尚未提供。
- 六类均显示“内容待补充”；唯一作品卡写明“占位展示 · 非真实项目”，封面也是占位。
- “创作空间”为默认显示名；没有自行填写真实姓名、账号、履历或联系方式。
- 中文使用本机字体回退，不请求在线字体；纸纹使用轻量 SVG 程序纹理，后续可以替换。

## 验证与截图

```powershell
npm run typecheck
npm run lint
npm run build
```

实际结果及限制见 [验证记录](docs/verification.md)。浏览器脚本使用 Playwright，首次使用其自带浏览器时运行：

```powershell
npx playwright install chromium
npm run check:page
```

本次直接使用已安装的 Chrome，无须下载浏览器：

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run check:page
```

验证另一端口时，在执行前设置 `$env:CHECK_URL = 'http://127.0.0.1:3001'`。脚本检查 320/375/768/1440px，锚点、禁用按钮、键盘焦点、资源、横向溢出和无动画，并生成截图。

- [桌面完整页面](docs/checks/page-1440.png) · [桌面首屏](docs/checks/first-screen-1440.png)
- [手机完整页面](docs/checks/page-375.png) · [手机首屏](docs/checks/first-screen-375.png)
- [平板完整页面](docs/checks/page-768.png) · [320px 窄屏](docs/checks/page-320.png)
- [浏览器原始检查结果](docs/checks/browser-results.json)

## 工程说明与边界

Next.js 16.3.5、React 19.3.0、TypeScript 5.9.3、Tailwind CSS 4.3.3，依赖由 `package-lock.json` 固定。安装方式核对了 [Next.js 官方说明](https://nextjs.org/docs/app/getting-started/installation)和 [Tailwind 官方说明](https://tailwindcss.com/docs/installation/framework-guides/nextjs)。

`eslint-config-next` 当前内置的 React 等插件与 ESLint 10 不兼容，因此使用匹配的 ESLint 9.39.5；npm 会提示此版本已停止维护。本次代码检查通过，安装审计为 0 漏洞。后续升级时需一起验证插件兼容性。

`.npmrc` 将缓存限制在项目的 `.npm-cache/`，缓存和构建产物已加入 `.gitignore`。项目最初为空目录且非 Git 仓库；没有改动其他项目或远程仓库。

首次 `next dev` 自动生成的 `AGENTS.md` 和 `CLAUDE.md` 已保留，包含当前 Next.js 版本的开发指导。

首页为静态预渲染内容。没有业务后端、数据库、密钥、登录、AI 调用、动画库、分析追踪、外部图片或字体请求；没有详情页、在线工具运行、搜索或筛选，也未执行公开部署。
