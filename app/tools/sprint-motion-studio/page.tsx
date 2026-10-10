import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./studio.module.css";

const repo = "https://github.com/wzh20010805-boop/Sprint-Motion-Studio";
const assetRoot = "/images/tools/sprint-motion-studio";

export const metadata: Metadata = {
  title: "Sprint Motion Studio · 小兵动画素材工坊 | 创作空间",
  description: "基于 FrameBaker 二次开发的动画素材工具。查看视频完整抽帧、源时序保留、GUI 与 CLI 互通、真实桌面测试画面及 P0/P1 开发进度。",
};

const capabilities = [
  { number: "01", title: "完整留住每一帧", text: "视频导入默认提取全部原始帧，保留重复画面。已经用 48、61、120、300 帧样例验证，输出数量与源显示帧逐一对应。", tag: "FULL-FRAME EXTRACTION" },
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
  { file: "editor.png", title: "完整帧进入编辑器", text: "真实桌面测试中，CLI 导入的 48 帧合成视频进入同一项目；左侧帧列表、中央画布与下方时间轴已正常渲染。", alt: "真实桌面编辑器：48帧合成测试视频的帧列表、中央彩条画布及逐帧时间轴" },
  { file: "import-defaults.png", title: "默认导入模式", text: "上传视频时，默认选择“全部原始帧”，同时说明保留源时序。界面明确标出当前仅完成抽帧，背景处理仍待下一阶段。", alt: "真实导入弹窗：全部原始帧默认选项、保留源帧与源时序说明、P2抠图待准备提示" },
  { file: "upload-complete.png", title: "一次真实的上传完成", text: "通过界面上传 48 帧测试视频，实际任务显示成功 1、失败 0。完成后可回到编辑器继续查看与调整素材。", alt: "真实GUI视频上传完成：已选择48帧合成样例，全部原始帧模式，成功1与失败0" },
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
              <Image src={`${assetRoot}/editor.png`} alt="Sprint Motion Studio真实桌面测试，展示48帧合成样例在逐帧编辑器中的画布与时间轴" width={1360} height={900} unoptimized loading="eager" />
              <figcaption><span>真实桌面画面 · 2026-10-10</span><span>合成样例 / 48 帧</span></figcaption>
              <div className={styles.sticker}><span>完整抽帧验证</span><strong>48 → 48</strong></div>
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
              <div className={styles.evidenceCopy}><span className={styles.badge}>真实抽帧验证</span><h3>源视频有多少帧，<br />就留下多少帧。</h3><div className={styles.frameCounts}>{[48, 61, 120, 300].map((count) => <span key={count}><strong>{count} → {count}</strong><small>源显示帧 / 输出 PNG</small></span>)}</div><p>在合成视频样例中，完整保留全部显示帧。GUI 与 CLI 对同一段 48 帧视频得到的源时序和原始 PNG 逐一一致。</p></div>
              <figure className={styles.contactSheet}><a href={`${assetRoot}/all-48-frames.png`} target="_blank" rel="noopener noreferrer" aria-label="打开48帧抽取结果原图（新标签页）"><Image src={`${assetRoot}/all-48-frames.png`} alt="合成视频的48张原始PNG按帧索引排列，彩条与时间变化连续保留；这不是小兵动作素材" width={512} height={288} unoptimized /></a><figcaption>48 帧输出检查图 · 合成测试视频<br /><span>样例用于验证抽帧，不代表小兵抠图效果。</span></figcaption></figure>
            </div>
          </section>

          <section id="screenshots" className={styles.section} aria-labelledby="screenshots-title">
            <div className={styles.sectionHeading}><span className="section-kicker">03 / FROM THE ACTUAL APP</span><h2 id="screenshots-title">真实桌面测试画面</h2><p>来自本地仓库的 P1 Windows 桌面验证。保留完整截图，点击可打开原图。</p></div>
            <div className={styles.gallery}>{screenshots.map((shot, index) => <figure className={styles.screenshot} key={shot.file}>
              <a href={`${assetRoot}/${shot.file}`} target="_blank" rel="noopener noreferrer" aria-label={`打开${shot.title}原图（新标签页）`}><Image src={`${assetRoot}/${shot.file}`} alt={shot.alt} width={1360} height={900} unoptimized /><span className={styles.expand} aria-hidden="true">↗</span></a>
              <figcaption><div className={styles.shotMeta}><span>桌面验证 / 0{index + 1}</span><time dateTime="2026-10-10">2026-10-10</time></div><h3>{shot.title}</h3><p>{shot.text}</p></figcaption>
            </figure>)}</div>
            <p className={styles.captionNote}>截图沿用上游编辑器界面与窗口名称，测试素材为本机生成的合成视频。</p>
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
