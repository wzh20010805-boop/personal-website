# Sprint Motion Studio 网页展示

更新日期：2026-10-10。详情路由：`/tools/sprint-motion-studio/`。

## 已确认范围

用户确认采用本地仓库中的名称 Sprint Motion Studio，添加“小工具”卡片和独立详情页，沿用网站风格，展示当前功能、使用流程、真实测试画面及后续计划。

本地资料来自 `D:/AIJOB/tools/Sprite Motion Studio/framebaker/`；本次没有修改工具工程、工作区数据或源素材。该工程的 origin 为 `https://github.com/wzh20010805-boop/Sprint-Motion-Studio.git`，上游为 FrameBaker。网页提供配置中的源码入口，没有虚构独立下载包。

## 内容依据

- `README_SFS.md`：P0/P1 范围、完整抽帧、源时序、GUI/CLI 共享、独立可编辑副本、任务状态、Windows 开发宿主的启动与依赖。
- `docs/progress.md`：当前阶段、限制和后续 P2–P6 计划。没有将上游所有功能或计划当作本项目已完成。
- `docs/p1-desktop.md`：2026-10-10 真实桌面编辑器、导入默认值、GUI 上传、保存重开与 GUI/CLI 逐帧等价性。
- `docs/evidence/p1/extraction-report.md`：合成视频 48/61/120/300 个源显示帧逐一提取；重复画面保留和真实 VFR 源时序。
- `docs/evidence/p1/quality-report.md`：输出为保留背景的原始帧，检查图来自合成测试视频，不是小兵动作素材或透明抠图结果。
- `README.zh-CN.md` 与 `THIRD_PARTY_NOTICES.md`：名称、FrameBaker 二次开发与上游 MIT 署名。

页面使用 P0/P1 开发版作为展示阶段，未将上游 package.json 的 0.5.0 作为本工具独立发行版本。没有把上游骨骼编辑、场景分层、云生成与宽权限 MCP 宣称为当前开发入口已开放。

## 真实图片

所有图片直接复制，不裁剪、重绘或生成。

| 网页图片 | 工具仓库源文件 | 尺寸 |
| --- | --- | --- |
| `editor.png` | `docs/evidence/p1/desktop-live/desktop-p1-editor.png` | 1360 × 900 |
| `import-defaults.png` | `docs/evidence/p1/desktop-live/desktop-p1-import-defaults.png` | 1360 × 900 |
| `upload-complete.png` | `docs/evidence/p1/desktop-live/desktop-p1-upload-complete.png` | 1360 × 900 |
| `all-48-frames.png` | `docs/evidence/p1/extraction-contact-cfr48.png` | 512 × 288 |

网页图片目录：`public/images/tools/sprint-motion-studio/`。截图保留上游编辑器外观，页面明确标记 2026-10-10 桌面验证及合成素材范围。

## 检查

`scripts/check-sprint-motion-studio.mjs` 验证首页两个工具的计数、实际卡片跳转、详情刷新、原有工具导航、三张桌面截图及抽帧检查图加载、原图打开、页面锚点和四种宽度布局；输出至 `docs/checks/sprint-motion-studio/`。

既有 `check-content-pages.mjs` 更新工具数量为 2，并将原工具截图检查限定到像素光标卡片，继续验证六分类和现有详情页。另执行 typecheck、lint 与静态构建。
