import { publicAsset } from "@/lib/public-assets";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./game.module.css";

export const metadata: Metadata = {
  title: "Colony Roads · 微境节点战争 | 创作空间",
  description: "一款开发中的像素风据点策略游戏。查看截至 2026-10-08 的开发进度、从 Tiled 地图到 Cocos 战场的制作流程，以及真实引擎测试画面。",
};

const progress = [
  { phase: "01", status: "已接入", title: "让群岛成为战场", text: "用 Tiled 编辑地图，接入 Cocos 原生绘制。54 个建筑外观组成 48 座逻辑建筑，红蓝双方各守一片阵地。", kind: "complete" },
  { phase: "02", status: "已接入", title: "让指挥与战斗运转", text: "步兵、枪兵、弓兵、骑兵各有生产与库存规则。支持框选、派兵、移动、攻击、建筑摧毁与主城胜负判定。", kind: "complete" },
  { phase: "03", status: "正在打磨", title: "让队伍走得更顺", text: "统一地图导航、桥坡通行、目标站位和 Box2D 碰撞。步兵 1 / 5 / 20 人坡道专项已完成到达验证，群体移动与大规模战斗性能仍在优化。", kind: "active" },
  { phase: "04", status: "后续计划", title: "走向更多设备", text: "Windows 原生 Debug 版本已有编译与启动验证。后续推进微信小游戏构建与真机测试，以及 Windows 正式发行和 Steam 接入。", kind: "planned" },
];

const screenshots = [
  { file: "battlefield.png", title: "群岛战场与小地图", date: "2026-10-05 · 普通关卡测试", text: "蓝方主城、兵营和防御塔已进入战场，右下角小地图同步展示全图与当前镜头范围。", alt: "真实 Cocos 普通关卡：蓝方建筑与生命值、镜头操作按钮及群岛小地图", width: 1600, height: 900 },
  { file: "troop-selection.png", title: "混合兵种，框选指挥", date: "2026-10-05 · 鼠标操作测试", text: "在场上框选步兵与弓兵，选择任意部分队伍，再下达新的移动或攻击命令。", alt: "真实鼠标框选测试：黄色选框覆盖蓝方步兵和弓兵，士兵脚下显示选择圆环", width: 1600, height: 900 },
  { file: "battle-lab.png", title: "为兵种搭一个测试场", date: "2026-10-05 · 兵种测试场界面", text: "分别配置双方四类兵种的人数，支持开始对战、暂停、原配置重测和左右互换，辅助调整战斗规则。", alt: "真实兵种测试场：双方出兵数量配置、开始对战与暂停按钮、实时统计区域", width: 1600, height: 900 },
  { file: "slope-test.png", title: "二十名士兵的坡道通行", date: "2026-10-07 · 群体移动专项", text: "真实引擎中的步兵通行验证，20 人全部到达，记录用时 86.77 模拟秒。图中保留导航与碰撞调试信息；本项验证不代表帧率验收。", alt: "真实坡道专项测试：蓝方步兵及导航碰撞轮廓，工具栏显示接受20、到达20、越界0", width: 1253, height: 705 },
];

const pipeline = [
  { label: "地图与资源", title: "先画世界，再定义道路", text: "Tiled 保存美术与逻辑标注，资源管线导出地图和贴图。WorldMap 统一可走区域，并为不同体型准备导航。" },
  { label: "规则与移动", title: "让一次命令真正落地", text: "ColonyGame 接收玩家操作，GameSession 推进生产、战斗与 AI。CrowdController 协调路线、通道和站位，物理层反馈真实位置。" },
  { label: "画面与反馈", title: "把战局画到屏幕上", text: "BattleView 同步单位动画、箭矢与位置插值；TiledMapView 显示地图，HUD、镜头和小地图帮助玩家读懂战场。" },
];

export default function ColonyRoadsPage() {
  return (
    <div id="top" className={styles.page}>
      <a className="skip-link" href="#content">跳到内容</a>
      <SiteHeader />
      <main id="content" className="category-page page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <Link prefetch={false} href="/">首页</Link><span aria-hidden="true">/</span>
          <Link prefetch={false} href="/games/">我做的小游戏</Link><span aria-hidden="true">/</span>
          <span aria-current="page">微境节点战争</span>
        </nav>
        <article>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <div className={styles.labels}><span className={styles.development}>开发进行中</span><span>2D 即时策略 / PIXEL RTS</span></div>
              <p className={styles.english}>COLONY ROADS</p>
              <h1>微境节点战争<span aria-hidden="true">✳</span></h1>
              <p className={styles.tagline}>在小小的群岛上，<br />指挥一场属于自己的战争。</p>
              <p className={styles.intro}>我正在制作的一款像素风据点策略游戏。建起兵营，组织队伍，穿过桥梁与坡道，向对方主城推进。这里记录它从地图、规则到真实战场，一步步成形的过程。</p>
              <div className={styles.actions}>
                <a className="candy-button candy-button--primary" href="#screenshots">看看游戏实况 <span aria-hidden="true">↘</span></a>
                <a className={styles.textLink} href="#roadmap">了解制作流程 <span aria-hidden="true">→</span></a>
              </div>
              <p className={styles.updated}>进度更新于 <time dateTime="2026-10-08">2026.10.08</time> · 尚未公开发行</p>
            </div>
            <figure className={styles.heroVisual}>
              <div className={styles.windowBar}><span aria-hidden="true">● ● ●</span><span>一座群岛，一场战局</span><span aria-hidden="true">↗</span></div>
              <Image src={publicAsset("/images/games/colony-roads/battlefield.png")} alt="微境节点战争真实开发画面：像素群岛上的蓝方主城、兵营、防御塔与小地图" width={1600} height={900} unoptimized loading="eager" />
              <figcaption><span>ENGINE CAPTURE</span>真实引擎画面 · 2026-10-05</figcaption>
              <span className={styles.sticker}>正在把想法<br />做成好玩的东西</span>
            </figure>
          </header>

          <dl className={styles.facts}>
            <div><dt>游戏类型</dt><dd>像素风 · 据点策略</dd></div>
            <div><dt>开发引擎</dt><dd>Cocos Creator 3.8.8</dd></div>
            <div><dt>当前阶段</dt><dd>玩法已接入，体验打磨中</dd></div>
            <div><dt>发行目标</dt><dd>微信小游戏 / Windows</dd></div>
          </dl>

          <section className={styles.section} id="progress" aria-labelledby="progress-title">
            <div className={styles.sectionHeading}><span className="section-kicker">01 / WORK IN PROGRESS</span><h2 id="progress-title">目前做到哪一步</h2><p>先让世界运转起来，再把每一次指挥打磨顺手。</p></div>
            <ol className={styles.progress}>
              {progress.map((item) => <li key={item.phase} className={`${styles.progressCard} ${styles[item.kind]}`}>
                <div className={styles.cardTop}><span className={styles.phase}>{item.phase}</span><span className={styles.status}>{item.status}</span></div>
                <h3>{item.title}</h3><p>{item.text}</p>
              </li>)}
            </ol>
            <aside className={styles.note}><span aria-hidden="true">✳</span><p>目前可在开发环境中运行与测试。兵种测试场仍保留独立的兼容移动路径；全兵种压力测试、性能优化、微信真机验证与正式发行，还在后面的清单上。</p></aside>
          </section>

          <section className={styles.section} id="roadmap" aria-labelledby="roadmap-title">
            <div className={styles.sectionHeading}><span className="section-kicker">02 / HOW IT COMES TO LIFE</span><h2 id="roadmap-title">从地图到一场战斗</h2><p>这张制作流程图，串起地图资源、玩家指令、游戏逻辑与画面反馈。</p></div>
            <figure className={styles.roadmap}>
              <div className={styles.roadmapBar}><span>制作流程 / 系统运行链</span><a href={publicAsset("/images/games/colony-roads/development-flow.png")} target="_blank" rel="noopener noreferrer" aria-label="打开制作流程原图">查看原图 <span aria-hidden="true">↗</span><span className="sr-only">（新标签页打开）</span></a></div>
              <Image src={publicAsset("/images/games/colony-roads/development-flow.png")} alt="制作流程图：Tiled地图编辑经资源管线进入WorldMap、CrowdController和CocosPhysicsMotor；玩家输入经ColonyGame与GameSession进入BattleView和Cocos画面，并连接HUD及TiledMapView。决策30Hz，物理60Hz。" width={5376} height={2872} unoptimized />
              <figcaption>作者提供的制作流程原图 · 决策 30 Hz / 物理 60 Hz 为系统更新频率</figcaption>
            </figure>
            <div className={styles.pipeline}>{pipeline.map((item) => <div key={item.label}><span className={styles.pipelineLabel}>{item.label}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>
          </section>

          <section className={styles.section} id="screenshots" aria-labelledby="screenshots-title">
            <div className={styles.sectionHeading}><span className="section-kicker">03 / FROM THE ACTUAL GAME</span><h2 id="screenshots-title">游戏实测实况</h2><p>来自项目中的真实引擎测试记录。保留完整画面，点击可打开原图。</p></div>
            <div className={styles.gallery}>{screenshots.map((shot, index) => <figure className={styles.screenshot} key={shot.file}>
              <a href={publicAsset(`/images/games/colony-roads/${shot.file}`)} target="_blank" rel="noopener noreferrer" aria-label={`打开${shot.title}原图（新标签页）`}>
                <Image src={publicAsset(`/images/games/colony-roads/${shot.file}`)} alt={shot.alt} width={shot.width} height={shot.height} unoptimized />
                <span className={styles.expand} aria-hidden="true">↗</span>
              </a>
              <figcaption><div className={styles.shotMeta}><span>实测记录 / 0{index + 1}</span><time dateTime={shot.date.slice(0, 10)}>{shot.date}</time></div><h3>{shot.title}</h3><p>{shot.text}</p></figcaption>
            </figure>)}</div>
          </section>

          <aside className={styles.nextStep}><span className="section-kicker">NEXT CHAPTER</span><h2>接下来，让它更好玩。</h2><p>继续优化队伍移动与战斗性能，完善兵种平衡和操作反馈，再逐步推进微信小游戏与 Windows 正式版本。Steam 接入与发行也在后续计划中。</p><span className={styles.nextLabel}>持续制作中，下一次再带来新进展。 <span aria-hidden="true">✳</span></span></aside>
        </article>
        <Link prefetch={false} className="back-to-works" href="/games/"><span aria-hidden="true">←</span> 返回游戏列表</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
