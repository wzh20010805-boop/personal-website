# Sprint Motion Studio 网页展示

更新日期：2026-10-10。详情路由：`/tools/sprint-motion-studio/`。

## 已确认范围

用户确认采用本地仓库中的名称 Sprint Motion Studio，添加“小工具”卡片和独立详情页，沿用网站风格，展示当前功能、使用流程、真实测试画面及后续计划。

本地资料来自 `D:/AIJOB/tools/Sprite Motion Studio/framebaker/`；本次没有修改工具工程、项目帧、时间轴内容或源素材。该工程的 origin 为 `https://github.com/wzh20010805-boop/Sprint-Motion-Studio.git`，上游为 FrameBaker。网页提供配置中的源码入口，没有虚构独立下载包。

## 内容依据

- `README_SFS.md`：P0/P1 范围、完整抽帧、源时序、GUI/CLI 共享、独立可编辑副本、任务状态、Windows 开发宿主的启动与依赖。
- `docs/progress.md`：当前阶段、限制和后续 P2–P6 计划。没有将上游所有功能或计划当作本项目已完成。
- `docs/p1-desktop.md`：2026-10-10 真实桌面编辑器、导入默认值、GUI 上传、保存重开与 GUI/CLI 逐帧等价性。
- `docs/evidence/p1/extraction-report.md`：合成视频 48/61/120/300 个源显示帧逐一提取；重复画面保留和真实 VFR 源时序。
- `docs/evidence/p1/quality-report.md`：输出为保留背景的原始帧，检查图来自合成测试视频，不是小兵动作素材或透明抠图结果。
- `README.zh-CN.md` 与 `THIRD_PARTY_NOTICES.md`：名称、FrameBaker 二次开发与上游 MIT 署名。

页面使用 P0/P1 开发版作为展示阶段，未将上游 package.json 的 0.5.0 作为本工具独立发行版本。没有把上游骨骼编辑、场景分层、云生成与宽权限 MCP 宣称为当前开发入口已开放。

## 最新真实项目案例

用户要求把合成测试案例替换为刚刚新建的项目。案例取自默认工作区中最新项目 `test`（ID `ab89e225-ec8a-4ecf-bd05-ef0956e95ad5`），素材名称为 `5s奔跑视频制作.mp4`。数据库通过 SQLite 只读连接核对，读取时包含实时 WAL。

- 源视频：1280 × 720，24 FPS，约 5.04 秒，121 个源显示帧；原始源素材目录确有 121 张 PNG。
- 当前项目：31 张 ready 帧资产，动画轴 `5s奔跑视频制作`、Main 轨道、31 个动画步骤、24 FPS。
- 源帧总数与当前编辑素材分别展示，不将 31 张资产误称为完整抽帧结果。
- 本地实际服务中打开项目，查看第 17 张资产并播放预览，暂停在第 12 / 31 步拍摄。没有重新导入视频或修改项目；拍摄前后项目修订号均为 6680。
- 为完整展示时间轴，拍摄时通过界面调整面板尺寸；最终拍摄会话拦截布局持久化请求，仅改变该浏览器的显示布局。

截图直接来自实际工具界面；原始帧直接复制，不裁剪、重绘或生成。

| 网页图片 | 内容 | 尺寸 |
| --- | --- | --- |
| `test-project-editor.png` | 最新 test 项目的编辑器全景 | 1600 × 1100 |
| `test-project-frame.png` | 第 17 张小兵奔跑帧资产 | 1600 × 1100 |
| `test-project-preview.png` | 24 FPS 播放预览，暂停在 12 / 31 步 | 1600 × 1100 |
| `test-project-source-frame.png` | 当前项目第一张原始帧 PNG | 1280 × 720 |

网页图片目录：`public/images/tools/sprint-motion-studio/`。工具列表封面、详情页主图、案例说明和三张截图均已换为本次真实项目；原始视频背景仍然保留。

## 检查

`scripts/check-sprint-motion-studio.mjs` 验证首页两个工具的计数、实际卡片跳转、详情刷新、原有工具导航、三张真实项目截图及原始帧加载、真实案例来源文案、原图打开、页面锚点和四种宽度布局；输出至 `docs/checks/sprint-motion-studio/`。

既有 `check-content-pages.mjs` 更新工具数量为 2，并将原工具截图检查限定到像素光标卡片，继续验证六分类和现有详情页。另执行 typecheck、lint 与静态构建。
