# 个人知识库展示资料

资料核对日期：2026-10-20。网站在“我做的小工具”收录个人知识库，详情路径 `/tools/personal-knowledge/`。

## 来源与当前状态

- 作者仓库：`wzh20010805-boop/personal-knowledge`，经 GitHub API 确认当前为私有仓库，默认分支 main。
- 本地资料：`D:\AIJOB\personal-knowledge` 的 README、前后端代码与既有构建；分支 dev，提交 `6b897d19cc38d8c2db3cff4dc60b579498cde848`。
- React/TypeScript 前端与 Python/FastAPI 后端，本机资料存储、SQLite、Chroma 与 BGE 嵌入；摘要和问答通常调用配置的 DeepSeek API，因此不能宣称完全离线。
- Session、跨会话检索和长期记忆需配置启用；记忆候选与观点草稿都需要用户确认。开发能力与默认能力在页面上分开描述。
- 没有公开安装包或在线问答服务。页面的仓库入口明确标注“需访问权限”，未开放源码或私有资料。

## 截图和案例

截图拍自项目真实 React 页面和 Python API，尺寸均为 1600 × 1100，未经界面合成。为避免公开私人笔记、消耗模型额度，使用网站忽略目录 `output/knowledge-demo/` 下全新 SQLite/Chroma 数据；未读取原有数据目录、备份或环境文件。演示进程使用确定性模型和嵌入替身，不调用真实模型，不能据此评估检索或模型质量。

导入两份专门编写的 Markdown：

1. `演示-学习计划.md`：每次学习后写三个要点，下次先回忆再补充遗漏。
2. `演示-复盘方法.md`：记录目标、实际完成、问题和下一步行动；未核实结论先保持待确认。

真实 API 导入成功后，提交“怎样把读过的资料整理成可执行的学习计划？”，获得带两条原文引用的模拟回答。引用通过应用自身的原文子串验证，实际点击引用打开右侧资料面板。两条观点草稿保留待确认，未替作者确认观点。确认数为 0，真实模型调用数为 0。

| 网站图片 | 实际界面 |
| --- | --- |
| `public/images/tools/personal-knowledge/library.png` | 资料库，两份演示笔记与摘要标签 |
| `public/images/tools/personal-knowledge/evidence-answer.png` | Agent 对话、演示问题、模拟回答与两条引用 |
| `public/images/tools/personal-knowledge/source-citation.png` | 点击引用后，右侧原文与段落定位 |
| `public/images/tools/personal-knowledge/viewpoint-review.png` | 两条待确认观点、0 条已确认观点 |

页面首屏、截图说明和案例均明确标注“演示资料与模拟模型输出”。网站仅收录展示代码、截图和资料说明，不收录知识库源码、数据库、用户笔记、API 配置或运行时文件。

## 验收方式

运行 lint、typecheck、静态构建，再以静态 HTTP 服务运行 `scripts/check-personal-knowledge.mjs`。脚本检查作品计数、卡片跳转与返回、四张图片与原图打开、隐私和模拟模型标注，以及 320/375/768/1440px 布局。结果位于 `docs/checks/personal-knowledge/`；已有内容回归脚本继续检查原有分类和像素光标。
