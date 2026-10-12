# 素材创意工坊 README 展示更新

更新时间：2026-10-13。发行包仍为 v1.0.7（2026-10-12 发布），本次同步最新 README 的界面与案例，不虚构新版本。

## 本轮证据与范围

- 远端 README blob：`ee032f862219dcea6fc167ce4ea1fc609d226f09`。
- 工具源码与本地 HEAD：`c4fa96cd47688aea80e524b208dca874fe44772b`；README 与媒体没有本地修改。本轮不修改工具或用户工作区。
- README 明确展示 1.0.7 的 test 项目与 14 帧动作。正式输出为 14 张透明 PNG，完整原视频与源帧仍保留，其它源帧需单独检查。
- 原样复制 `docs/media/sfs/v1.0.7/` 中的 home、editor、library、mask-workshop、alignment-workshop、frame_000001、sprite-sheet PNG 和 run-loop GIF；没有裁剪、重绘或改变 Alpha。
- 五张界面截图均为 1360 × 900；透明帧为 128 × 128，规则图集为 1820 × 130，二者均为 RGBA，Alpha 范围 0–255。复制文件与源文件哈希一致。
- 首页主图、工具卡片和四张流程截图替换为当前实拍。保留页面样式和路由，案例更新为 14 帧，移除旧 27 帧与 v1.0.0 界面说明。
- 新增正式导出的透明帧、精灵图集原图与动作 GIF 入口。GIF 单独打开，不在页面自动播放。棋盘格是页面显示背景，不写入透明 PNG 或图集。
- 模型说明以最新 README 为准：包内没有 u2netp；首次选择“离线导入模型”或“下载 CPU 模型（需联网）”；已安装模型复用，准备好后可离线抠图。模型位于 `%LOCALAPPDATA%\SpriteMotionStudio\models`，另一台电脑需单独准备。
- 下载仍指向 v1.0.7 便携 ZIP；不把文档更新当作二进制重发。

## 检查

已有浏览器验收增加 14 帧案例、动作预览原文件、透明导出图和模型复用说明检查；仍覆盖原图打开、下载链接、导航及四种屏幕宽度。发布后检查公网页面的当前截图与模型说明。具体通过情况以本轮终端和 Pages 工作流为准。

## 历史记录

### 2026-10-12 v1.0.7 网页更新

更新时间：2026-10-12。沿用 `/tools/sprint-motion-studio/` 路由，保留现有导航和版式。

## 本轮最新内容

- 最新正式 Release：`v1.0.7`，2026-10-12 发布，非预发布。仓库 README 的安装段仍写 1.0.0，当前版本以 Release 为准。
- 发布来源：https://github.com/wzh20010805-boop/Sprint-Motion-Studio/releases/tag/v1.0.7
- 工具源码版本：`5f8c306ed8c7f236e85d25bd3f284bc978046d8a`，与本地工具 HEAD 一致。
- 中文名更新为“素材创意工坊”，英文名按 Release 改为 Sprite Motion Studio。GitHub 仓库名和网站路由保留 Sprint，避免破坏旧入口。
- 更新介绍：主编辑器与抠图窗口支持左右方向键逐帧预览；素材库按项目下的视频/照片分类；帧位移、缩放、旋转与透明度用于生产预览和导出；非空半透明 PNG 支持人工确认。发布说明还记录了播放闪烁和旧抠图任务问题修复。
- Windows x64 便携包：`SpriteMotionStudio-win-x64-1.0.7.zip`，554216275 字节，页面标注约 554 MB。
- 下载：https://github.com/wzh20010805-boop/Sprint-Motion-Studio/releases/download/v1.0.7/SpriteMotionStudio-win-x64-1.0.7.zip
- 校验文件：上述地址加 `.sha256`。Release 公布整包摘要 `a9a09ece5eb70511b4685dd30ac10d416b68bddbef28ea45871ed0063cdd8f4f`。
- 解压后运行 SpriteMotionStudio.exe 或 START.cmd；运行时已附包，CPU 抠图模型仍需另行准备。升级时通过菜单继续选择原工作区，保留源素材和已保存遮罩。
- 现有四张案例截图仍为 2026-10-11 的 v1.0.0 实拍。网页明确标记历史版本，保持源帧与案例帧数区分；没有伪造 v1.0.7 实拍。
- 本轮不修改工具工程、用户工作区或网站的其他作品。下面保留上次版本更新的来源记录。

## v1.0.0 历史更新记录


更新时间：2026-10-11。详情路由：`/tools/sprint-motion-studio/`。

用户要求更新最新功能、公开安装包下载与使用方法，并推送个人网页仓库，让其他用户查看和使用工具。沿用已确认的页面样式，保留此前授权的同一小兵奔跑案例，更新为本版实拍截图。

## 版本与来源

- 最新正式 Release：`v1.0.0`，2026-10-11 发布，非预发布。
- 项目仓库：https://github.com/wzh20010805-boop/Sprint-Motion-Studio
- 发布说明：https://github.com/wzh20010805-boop/Sprint-Motion-Studio/releases/tag/v1.0.0
- 来源源码版本：`5afcc861db19e2d1d38db63e75e37bab86ef93d9`。本地工具仓库 HEAD 与远端一致，README、使用指南和展示图片没有本地修改。本轮没有修改工具工程或用户工作区。
- 依据：`README.md`、`docs/p3-p5-guide.md`、`docs/releases/v1.0.0.md`、Release 正文。历史 progress.md 下半部不作为当前范围。

已实现并写入网页：完整视频/GIF/PNG 导入、源帧与时序保留、CPU 抠图和遮罩修正、公共画布与地面基准、审核导出 PNG/规则图集/manifest/MP4/ZIP、共享 CLI 与九工具 MCP、Windows 便携发行。

尚未完成：干净 Windows 虚拟机验收、真实美术逐帧质量确认、Cocos 实际接入和播放。页面不把这些写成已完成，也不把本轮网页检查写成安装包实际安装验证。

## 公开下载

- 文件：`SpriteMotionStudio-win-x64-1.0.0.zip`，Windows x64，552404998 字节（页面标示约 552 MB）。
- URL：https://github.com/wzh20010805-boop/Sprint-Motion-Studio/releases/download/v1.0.0/SpriteMotionStudio-win-x64-1.0.0.zip
- 校验文件：同一 URL 后附 `.sha256`。
- GitHub Release API 确认安装包为 uploaded；公开下载链接 HEAD 返回 200，Content-Length 与 Release 资产大小一致。
- 解压至可写目录，打开 `SpriteMotionStudio.exe` 或 `START.cmd`，不要求另装 Node.js/Bun/Python。
- u2netp 模型未随包附带，需在菜单明确下载或离线导入。包未签名，工作区和模型默认保留在用户数据目录。
- 可下载的是便携 ZIP，不虚构 MSI 或传统安装向导。版本数据集中在 `data/sprint-motion-studio.ts`。

## 当前案例与图片

截图来自 `docs/media/sfs/`，原样复制，无裁剪、重绘或生成。案例来源为此前提供的 `5s奔跑视频制作.mp4`；121 张完整源帧和原视频合计 122 个素材，当前动作 27 帧，编辑器截图显示 12 FPS。原始来源和编辑动作分别统计，不宣称全部帧已通过美术审核。示例媒体仅展示工作流程，不作为 MIT 授权素材库。

| 网站文件 | 工具仓库来源 | 尺寸 |
| --- | --- | --- |
| `v1-editor.png` | `docs/media/sfs/editor.png` | 1344 × 861 |
| `v1-library.png` | `docs/media/sfs/library.png` | 1344 × 861 |
| `v1-mask-workshop.png` | `docs/media/sfs/mask-workshop.png` | 1344 × 835 |
| `v1-alignment-workshop.png` | `docs/media/sfs/alignment-workshop.png` | 1344 × 835 |

保留此前 `test-project-source-frame.png` 作为原始背景画面对照；旧桌面截图不再用于当前展示。

## 验证

`scripts/check-sprint-motion-studio.mjs` 检查首页计数、两件工具卡片和导航、当前四张实拍截图、原始帧加载、下载入口的实际 URL、启动和模型说明、SHA256 链接、原图打开及 320/375/768/1440px 布局。输出至 `docs/checks/sprint-motion-studio/`。

`scripts/check-public-site.mjs` 继续检查带仓库路径的公网页面、图片、导航和当前下载入口。执行 lint、typecheck、静态构建后推送，等待 Pages 发布并检查公开网页；具体结果以本轮终端输出与 GitHub Actions 为准。
