# 微境节点战争展示页

更新日期：2026-10-08。页面地址：`/games/colony-roads/`。

## 内容依据

游戏资料读取自本地 `D:/AIJOB/games/game/`，没有改动游戏工程。

- `README.md`：游戏名称、四兵种、48 座逻辑建筑、建筑攻防、操作、Cocos 版本与发行目标。
- `docs/architecture/game-framework-2026-10-08.md`：当前 WorldMap、CrowdController、CocosPhysicsMotor、GameSession、BattleView 和地图资源运行链；测试场仍有独立兼容路径。
- `docs/crowd-system-2026-10-07.md`：群体移动接入、通道预约、站位与实际 Box2D；大规模运动性能仍需优化。
- `docs/slope-passage-fix-2026-10-07.md`：步兵 1 / 5 / 20 人专项最终到达验证；20 人为 86.77 模拟秒，不能外推为性能验收或全兵种完成。
- `docs/RTS_VALIDATION.md`：2026-10-05 版本的引擎测试画面及玩法验证。页面明确标出截图日期，不将历史截图冒充最新构建。

不把设计文档中的紧密方阵当作已完成，也不把 Windows Debug 验证当作 Steam 已发行。网站中的已收录作品数表示展示内容数量。

## 图片来源

图片完整复制，无裁剪、重绘或 AI 生成。网站中的可查看原图均为本地静态资源。

| 网站文件 | 原始文件 |
| --- | --- |
| `development-flow.png` | 用户附件 `codex-clipboard-56198ec0-46b3-4166-b57f-a9d2a4fa4a5e.png`，5376 × 2872 |
| `battlefield.png` | `cocos/validation/platform-defenders/01-local-map-with-minimap.png` |
| `troop-selection.png` | `cocos/validation/rts-compound/03-pc-box-preview.png` |
| `battle-lab.png` | `cocos/validation/platform-defenders/08-battle-lab.png` |
| `slope-test.png` | `artifacts/slope-passage-fix-20261007/slope-final-moving.png` |

图片位于 `public/images/games/colony-roads/`。前面三张游戏截图为 1600 × 900，坡道专项图为 1253 × 705。坡道图保留调试叠加层和模拟时间说明。

## 验证

`scripts/check-game-showcase.mjs` 验证首页分类计数、分类到详情的实际点击、页面刷新、四张实测图加载与完整比例、锚点、流程原图新标签打开、浏览器错误与 320 / 375 / 768 / 1440px 横向溢出；输出截图和 `results.json` 至 `docs/checks/game-showcase/`。

另执行项目 lint、typecheck、静态构建及既有内容页回归。静态构建输出 `out/games/colony-roads/index.html`，不需要 Next.js 服务端图片接口。
