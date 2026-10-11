# Sprint Motion Studio v1.0.0 网页更新

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
