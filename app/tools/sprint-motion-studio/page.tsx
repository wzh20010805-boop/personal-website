import { publicAsset } from "@/lib/public-assets";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./studio.module.css";

const repo = "https://github.com/wzh20010805-boop/Sprint-Motion-Studio";
const assetRoot = publicAsset("/images/tools/sprint-motion-studio");

export const metadata: Metadata = {
  title: "Sprint Motion Studio · 小兵动画素材工坊 | 创作空间",
  description: "基于 FrameBaker 二次开发的动画素材工具。查看视频完整抽帧、源时序保留、GUI 与 CLI 互通、真实桌面测试画面及 P0/P1 开发进度。",
};

const capabilities = [
  { number: "01", title: "完整留住每一帧", text: "视频导入默认提取全部原始帧，保留重复画面。本次小兵奔跑案例的源视频包含 121 帧，原始素材目录完整保留了 121 张 PNG。", tag: "FULL-FRAME EXTRACTION" },
  { number: "02", title: "让动作保留原来的节奏", text: "保存每帧的源时间戳与显示时长，支持变帧率视频的原始时间信息。编辑器预览可能量化，精确时序以源记录为准。", tag: "SOURCE TIMING" },
  { number: "03", title: "手动编辑，也能命令行处理", text: "图形界面与 CLI 共用一份工作区和项目。导入后在画布与时间轴中检查、调整帧；保存并重新打开后，改动仍然保留。", tag: "GUI + CLI" },
  { number: "04", title: "原素材与编辑副本分开", text: "保留原视频和完整源帧，用独立副本进行编辑。任务可查询、等待或取消；失败与中断有明确记录，方便继续处理。", tag: "KEEP THE ORIGINALS" },
];

const workflow = [
  { title: "创建项目", text: "为一个角色或动作建立独立工作区，整理来源素材。", hint: "01 / PROJECT" },
  { title: "导入视频", text: "在项目编辑器上传视频，默认选择“全部原始帧”。", hint: "02 / IMPORT" },
  { title: "完整抽帧", text: "核对帧数、顺序与尺寸，保存原始 PNG 和源时间信息。", hint: "03 / EXTRACT" },
  { title: "进入编辑器", text: "在画布与时间轴中查看素材，调整帧并保存项目。", hint: "04 / EDIT" },
];

const screenshots = [
  { file: "test-project-editor.png", title: "新建项目 · 小兵奔跑", text: "刚刚创建的 test 项目，以“5s奔跑视频制作.mp4”为素材。左侧显示 31 张帧资产，中央画布查看持剑盾小兵，下方是同名动画轴与 Main 轨道。", alt: "test 项目的真实编辑界面：31张小兵奔跑帧资产、角色画布及5s奔跑视频制作动画轴" },
  { file: "test-project-frame.png", title: "逐帧查看动作", text: "选中帧资产 #17，单独检查这一帧的角色姿态。可以在帧列表与画布间对照查看，当前图片仍保留源视频的浅色背景。", alt: "test 项目中选中第17张帧资产，画布展示持剑盾小兵的奔跑姿态" },
  { file: "test-project-preview.png", title: "播放预览", text: "在项目画布内播放当前动作，截图暂停在第 12 / 31 步。播放控制条显示 24 FPS，可结合时间轴检查动作衔接与节奏。", alt: "test 项目的小兵奔跑播放预览，控制条显示24 FPS与第12步共31步" },
];

export default function SprintMotionStudioPage() {
  return (
    <div id="top" className={styles.page}>
      <a className="skip-link" href="#content">跳到内容</a>
      <SiteHeader />
      <main id="content" className="category-page page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <Link prefetch={false} href="/">首页</Link><span aria-hidden="true">/</span>
          <Link prefetch={false} href="/tools/">我做的小工具</Link><span aria-hidden="true">/</span>
          <span aria-current="page">Sprint Motion Studio</span>
        </nav>

        <article>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <div className={styles.labels}><span>P0 / P1 开发版</span><span>WINDOWS · 本地工具</span></div>
              <p className={styles.chineseTitle}>小兵动画素材工坊</p>
              <h1>Sprint Motion<br /><span>Studio</span><span className={styles.spark} aria-hidden="true">✳</span></h1>
              <p className={styles.tagline}>从一段视频，<br />留住每一帧动作。</p>
              <p className={styles.intro}>我在 FrameBaker 基础上二次开发的动画素材工作台。先把视频完整拆成可检查、可编辑的原始帧，让图形界面与命令行连起来，再逐步补齐小兵动画的游戏素材制作流程。</p>
              <div className={styles.actions}>
                <a className="candy-button candy-button--primary" href="#screenshots">看看真实界面 <span aria-hidden="true">↘</span></a>
                <a className={styles.textLink} href={repo} target="_blank" rel="noopener noreferrer">查看源码与说明 <span aria-hidden="true">↗</span><span className="sr-only">（新标签页打开）</span></a>
              </div>
              <p className={styles.updated}>资料更新于 <time dateTime="2026-10-10">2026.10.10</time> · 源码开发版</p>
            </div>
            <figure className={styles.heroVisual}>
              <div className={styles.windowBar}><span aria-hidden="true">● ● ●</span><span>FRAME BY FRAME</span><span aria-hidden="true">↗</span></div>
              <Image src={`${assetRoot}/test-project-editor.png`} alt="Sprint Motion Studio中刚创建的test项目，展示小兵奔跑帧资产、角色画布及动画轴" width={1600} height={1100} unoptimized loading="eager" />
              <figcaption><span>真实项目 · 2026-10-10</span><span>test / 小兵奔跑</span></figcaption>
              <div className={styles.sticker}><span>当前帧资产</span><strong>31 帧</strong></div>
            </figure>
          </header>

          <dl className={styles.facts}>
            <div><dt>适用方向</dt><dd>游戏动画素材制作</dd></div>
            <div><dt>当前产物</dt><dd>原始 PNG + 源时间信息</dd></div>
            <div><dt>操作方式</dt><dd>图形界面 / 命令行</dd></div>
            <div><dt>开发基础</dt><dd>FrameBaker · 二次开发</dd></div>
          </dl>

          <aside id="scope-note" className={styles.scopeNote}><span aria-hidden="true">✳</span><p>当前阶段已完成完整抽帧与 GUI / CLI 互通。原始帧仍保留视频背景；自动抠图、对齐、正式导出、独立发行包与 Cocos 接入，会在后续阶段逐步推进。</p></aside>

          <section id="capabilities" className={styles.section} aria-labelledby="capabilities-title">
            <div className={styles.sectionHeading}><span className="section-kicker">01 / WHAT WORKS TODAY</span><h2 id="capabilities-title">目前能做什么</h2><p>先把素材可靠地留下来，再开始一帧一帧地打磨。</p></div>
            <div className={styles.capabilities}>{capabilities.map((item) => <div className={styles.capability} key={item.number}><div className={styles.cardTop}><span>{item.number}</span><span>{item.tag}</span></div><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>
          </section>

          <section id="workflow" className={styles.section} aria-labelledby="workflow-title">
            <div className={styles.sectionHeading}><span className="section-kicker">02 / THE MAKING FLOW</span><h2 id="workflow-title">从视频到逐帧素材</h2><p>当前工作流从项目出发，连接素材导入、抽帧与编辑。</p></div>
            <ol className={styles.workflow}>{workflow.map((step) => <li key={step.hint}><span>{step.hint}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
            <div className={styles.evidence}>
              <div className={styles.evidenceCopy}><span className={styles.badge}>最新项目 / test</span><h3>一段小兵奔跑视频，<br />进入逐帧工作台。</h3><div className={styles.frameCounts}><span><strong>121 → 121</strong><small>源显示帧 / 原始 PNG</small></span><span><strong>31 帧</strong><small>当前项目帧资产</small></span><span><strong>1280 × 720</strong><small>源视频与原始帧尺寸</small></span><span><strong>24 FPS</strong><small>当前动画轴播放帧率</small></span></div><p>素材来自“5s奔跑视频制作.mp4”，源视频约 5 秒。完整源帧单独保留；当前编辑项目有 31 张帧资产与 31 个动画步骤，和源视频总帧数分别统计。</p></div>
              <figure className={styles.contactSheet}><a href={`${assetRoot}/test-project-source-frame.png`} target="_blank" rel="noopener noreferrer" aria-label="打开小兵奔跑原始帧原图（新标签页）"><Image src={`${assetRoot}/test-project-source-frame.png`} alt="5s奔跑视频制作素材的第一张原始PNG，浅色背景上是一名持剑盾的金发小兵" width={1280} height={720} unoptimized /></a><figcaption>小兵奔跑 · 第一张原始帧<br /><span>直接来自项目素材，保留视频背景。</span></figcaption></figure>
            </div>
          </section>

          <section id="screenshots" className={styles.section} aria-labelledby="screenshots-title">
            <div className={styles.sectionHeading}><span className="section-kicker">03 / FROM THE ACTUAL APP</span><h2 id="screenshots-title">真实桌面测试画面</h2><p>刚刚新建的 test 项目：小兵奔跑素材的编辑、逐帧查看与播放预览。点击可打开完整原图。</p></div>
            <div className={styles.gallery}>{screenshots.map((shot, index) => <figure className={styles.screenshot} key={shot.file}>
              <a href={`${assetRoot}/${shot.file}`} target="_blank" rel="noopener noreferrer" aria-label={`打开${shot.title}原图（新标签页）`}><Image src={`${assetRoot}/${shot.file}`} alt={shot.alt} width={1600} height={1100} unoptimized /><span className={styles.expand} aria-hidden="true">↗</span></a>
              <figcaption><div className={styles.shotMeta}><span>test 项目 / 0{index + 1}</span><time dateTime="2026-10-10">2026-10-10</time></div><h3>{shot.title}</h3><p>{shot.text}</p></figcaption>
            </figure>)}</div>
            <p className={styles.captionNote}>截图直接拍摄于本地工具的实际项目界面，素材为“5s奔跑视频制作.mp4”；保留当前背景，未生成或重绘角色画面。</p>
          </section>

          <section id="getting-started" className={styles.section} aria-labelledby="getting-started-title">
            <div className={styles.startPanel}>
              <div><span className="section-kicker">04 / TRY THE DEV VERSION</span><h2 id="getting-started-title">从源码开发版开始</h2><p>当前在 Windows 开发环境中使用，需要 Bun、Electron，以及视频抽帧所需的 FFmpeg / ffprobe。</p><a className="candy-button candy-button--secondary" href={repo} target="_blank" rel="noopener noreferrer">前往项目仓库 <span aria-hidden="true">↗</span><span className="sr-only">（新标签页打开）</span></a></div>
              <ol><li><strong>准备开发环境</strong><span>根据仓库 README_SFS.md 安装固定运行时和依赖。</span></li><li><strong>启动工作台</strong><span>在项目目录双击 Start-SFS.cmd，进入图形界面。</span></li><li><strong>先试一个短视频</strong><span>新建项目后，通过“导入素材 → 上传文件”提取全部原始帧。</span></li></ol>
            </div>
          </section>

          <section id="roadmap" className={styles.section} aria-labelledby="roadmap-title">
            <div className={styles.sectionHeading}><span className="section-kicker">05 / THE NEXT CHAPTER</span><h2 id="roadmap-title">下一步，走向游戏素材管线</h2><p>完整抽帧是起点，接下来继续补齐从原始画面到游戏动画的环节。</p></div>
            <div className={styles.roadmap}><div><span>P2 / 计划中</span><h3>场景抠图</h3><p>选择真实角色素材，验证背景去除与边缘质量，加入人工修正。</p></div><div><span>P3 / 计划中</span><h3>比例与位置对齐</h3><p>统一动作的比例、地面参考与根轨迹，让素材更便于组合。</p></div><div><span>P4–P6 / 计划中</span><h3>导出与游戏接入</h3><p>推进正式导出、AI 工具接入、独立发行包与 Cocos Creator 实测。</p></div></div>
          </section>

          <aside className={styles.origin}><span aria-hidden="true">✳</span><p>本项目基于 <a href="https://github.com/taotao7/FrameBaker" target="_blank" rel="noopener noreferrer">FrameBaker<span className="sr-only">（新标签页打开）</span></a> 二次开发，保留上游历史与 MIT 许可署名。当前功能范围以项目的 README_SFS.md 和开发进度文档为准。</p></aside>
        </article>
        <Link prefetch={false} className="back-to-works" href="/tools/"><span aria-hidden="true">←</span> 返回小工具列表</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
