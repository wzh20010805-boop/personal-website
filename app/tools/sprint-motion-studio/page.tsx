import { publicAsset } from "@/lib/public-assets";
import { studioRelease } from "@/data/sprint-motion-studio";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./studio.module.css";

const repo = studioRelease.repoUrl;
const assetRoot = publicAsset("/images/tools/sprint-motion-studio");

export const metadata: Metadata = {
  title: "Sprite Motion Studio · 素材创意工坊 | 创作空间",
  description: "下载 Sprite Motion Studio 1.0.7 Windows 便携版，查看完整抽帧、抠图修正、地面基准对齐、审核导出、CLI / MCP 互通和真实小兵奔跑案例。",
};

const capabilities = [
  { number: "01", title: "完整留住每一帧", text: "导入 MP4、GIF 或 PNG 序列，保留原文件、全部显示帧与源时间信息。素材库按项目下的视频 / 照片分类，上传可选择归属项目；保留跨项目复用、自定义文件夹和原件。", tag: "IMPORT + SOURCE TIMING" },
  { number: "02", title: "把角色从背景中取出来", text: "本地 CPU 自动抠图，框选完整角色与装备，再用擦除、恢复笔刷修正遮罩。支持撤销、Alpha 与黑白底检查，也能用 ← / → 方向键逐帧核对透明边缘。", tag: "MATTING + MASK REPAIR" },
  { number: "03", title: "让动作站在同一条地面上", text: "统一角色画布、比例与锚点，设置固定地面基准或根轨迹关键帧，再调整逐帧偏移。主编辑器的位移、缩放、旋转与透明度同步用于生产预览和导出，让动作更便于组合。", tag: "CANVAS + GROUND ROOT" },
  { number: "04", title: "检查后，导出完整素材包", text: "完成遮罩与对齐审核后，导出透明 PNG 序列、多页图集、manifest、联系表、背景 MP4 和完整 ZIP。非空半透明 PNG 也支持人工确认；未审核素材可以显式导出草稿。", tag: "REVIEW + EXPORT" },
  { number: "05", title: "手动制作，也能接入 Codex", text: "图形界面、CLI 与九工具 MCP 共用工作区和导出逻辑。可以查询任务、运行素材流程、继续中断任务，遇到需要人工检查的步骤会暂停。", tag: "GUI + CLI + MCP" },
  { number: "06", title: "解压启动，少一步环境准备", text: "Windows 便携包自带运行时、FFmpeg 和字体，无需另装 Node.js、Bun 或 Python。自动抠图模型单独下载或离线导入，其余本地操作可断网使用。", tag: "WINDOWS PORTABLE" },
];

const workflow = [
  { title: "导入素材", text: "创建项目，上传视频、GIF 或 PNG 序列，完整保留来源。", hint: "01 / IMPORT" },
  { title: "抠图与修正", text: "生成抠图初稿，擦除或恢复遮罩，逐帧确认角色边缘。", hint: "02 / CUTOUT" },
  { title: "对齐与预览", text: "统一画布、比例和地面根点，微调偏移并检查动作。", hint: "03 / ALIGN" },
  { title: "审核与导出", text: "完成全动作预检与当前修订确认，导出 PNG、图集和 ZIP。", hint: "04 / EXPORT" },
];

const screenshots = [
  { file: "v1-editor.png", title: "动画编辑器 · 小兵奔跑", text: "v1.0.0 Windows 便携版的真实编辑界面。“5s奔跑视频制作.mp4”案例当前整理为 27 帧，抠图后的角色进入画布与时间轴，动画轴设置为 12 FPS。", alt: "Sprint Motion Studio 1.0.0实拍编辑器：27帧小兵奔跑角色、透明画布及12 FPS动画轴", height: 861 },
  { file: "v1-library.png", title: "素材库 · 原件与完整源帧", text: "视频原件和 121 张完整源帧保存在素材库中，合计 122 个素材；可以对照原图，并跨项目复用。源帧数量与编辑后的动作帧数分别保留。", alt: "新版素材库显示122个素材，包含原视频与完整抽取的小兵奔跑源帧", height: 861 },
  { file: "v1-mask-workshop.png", title: "抠图与遮罩修正", text: "在原始画面中框住角色，生成抠图初稿，用擦除和恢复笔刷修边。右侧仍标明“待人工检查”，逐帧核对后再确认，不把初稿当作已审核成品。", alt: "场景抠图与修正窗口，展示原始角色、框选、擦除恢复笔刷及待人工检查状态", height: 835 },
  { file: "v1-alignment-workshop.png", title: "地面基准与审核导出", text: "将原画面与共享后端的透明输出预览并排查看，配置统一画布、比例、锚点和根位置。完成越界预检与修订确认后，可正式导出 PNG 与图集。", alt: "地面基准统一比例与导出窗口，展示画布参数、地面根位置、透明预览以及正式导出入口", height: 835 },
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
          <span aria-current="page">素材创意工坊</span>
        </nav>

        <article>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <div className={styles.labels}><span>v{studioRelease.version} · 已提供下载</span><span>WINDOWS 64 位 · 便携版</span></div>
              <p className={styles.chineseTitle}>素材创意工坊</p>
              <h1>Sprite Motion<br /><span>Studio</span><span className={styles.spark} aria-hidden="true">✳</span></h1>
              <p className={styles.tagline}>让创意，<br />动起来！</p>
              <p className={styles.intro}>我在 FrameBaker 基础上二次开发的动画素材工作台。完整抽帧、抠图修正、地面基准对齐，再审核导出透明帧与图集。现在已打包为 Windows 便携版，下载解压就能开始制作。</p>
              <div className={styles.actions}>
                <a className="candy-button candy-button--primary" href={studioRelease.downloadUrl} target="_blank" rel="noopener noreferrer">下载 Windows 便携版 <span aria-hidden="true">↗</span><span className="sr-only">（新标签页打开）</span></a>
                <a className={styles.textLink} href="#getting-started">安装与使用 <span aria-hidden="true">↓</span></a>
                <a className={styles.textLink} href={repo} target="_blank" rel="noopener noreferrer">查看源码与说明 <span aria-hidden="true">↗</span><span className="sr-only">（新标签页打开）</span></a>
              </div>
              <p className={styles.updated}>版本更新于 <time dateTime={studioRelease.publishedDate}>2026.10.12</time> · ZIP 约 554 MB · 解压启动</p>
            </div>
            <figure className={styles.heroVisual}>
              <div className={styles.windowBar}><span aria-hidden="true">● ● ●</span><span>FRAME BY FRAME</span><span aria-hidden="true">↗</span></div>
              <Image src={`${assetRoot}/v1-editor.png`} alt="Sprint Motion Studio 1.0.0便携版真实界面，展示27帧抠图小兵奔跑案例" width={1344} height={861} unoptimized loading="eager" />
              <figcaption><span>v1.0.0 案例实拍 · 2026-10-11</span><span>小兵奔跑 / 27 帧</span></figcaption>
              <div className={styles.sticker}><span>Windows 便携版</span><strong>v{studioRelease.version}</strong></div>
            </figure>
          </header>

          <dl className={styles.facts}>
            <div><dt>适用方向</dt><dd>游戏动画素材制作</dd></div>
            <div><dt>当前产物</dt><dd>透明 PNG / 图集 / ZIP</dd></div>
            <div><dt>操作方式</dt><dd>图形界面 / CLI / MCP</dd></div>
            <div><dt>开发基础</dt><dd>FrameBaker · 二次开发</dd></div>
          </dl>

          <aside id="scope-note" className={styles.scopeNote}><span aria-hidden="true">✳</span><p>v1.0.7 更新：主编辑器和抠图窗口支持 ← / → 逐帧预览，素材库按项目的视频 / 照片分类，修复播放闪烁，并统一预览与导出的帧变换。原始素材保留背景，透明处理结果单独保存；正式导出仍需人工检查，Cocos 实际播放验证尚未完成。</p></aside>

          <section id="capabilities" className={styles.section} aria-labelledby="capabilities-title">
            <div className={styles.sectionHeading}><span className="section-kicker">01 / WHAT WORKS TODAY</span><h2 id="capabilities-title">目前能做什么</h2><p>v1.0.7 在导入、修边、对齐与导出的基础上，继续优化素材整理和逐帧检查。</p></div>
            <div className={styles.capabilities}>{capabilities.map((item) => <div className={styles.capability} key={item.number}><div className={styles.cardTop}><span>{item.number}</span><span>{item.tag}</span></div><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>
          </section>

          <section id="workflow" className={styles.section} aria-labelledby="workflow-title">
            <div className={styles.sectionHeading}><span className="section-kicker">02 / THE MAKING FLOW</span><h2 id="workflow-title">从视频到逐帧素材</h2><p>保留原件，在独立处理结果上制作；每个动作都能回到源画面检查。</p></div>
            <ol className={styles.workflow}>{workflow.map((step) => <li key={step.hint}><span>{step.hint}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
            <div className={styles.evidence}>
              <div className={styles.evidenceCopy}><span className={styles.badge}>真实奔跑案例 / v1.0.0 实拍</span><h3>保留完整来源，<br />把动作一帧一帧做好。</h3><div className={styles.frameCounts}><span><strong>121 张</strong><small>完整源帧，保留视频原件</small></span><span><strong>27 帧</strong><small>案例截图中的动作素材</small></span><span><strong>1280 × 720</strong><small>源视频与原始帧尺寸</small></span><span><strong>12 FPS</strong><small>截图中的动画轴设置</small></span></div><p>继续使用“5s奔跑视频制作.mp4”案例。原件、完整源帧和截图中的 27 帧动作分别保留；工具支持修正透明边缘、统一画布并导出，展示不代表全部帧已通过美术审核。</p></div>
              <figure className={styles.contactSheet}><a href={`${assetRoot}/test-project-source-frame.png`} target="_blank" rel="noopener noreferrer" aria-label="打开小兵奔跑原始帧原图（新标签页）"><Image src={`${assetRoot}/test-project-source-frame.png`} alt="5s奔跑视频制作素材的第一张原始PNG，浅色背景上是一名持剑盾的金发小兵" width={1280} height={720} unoptimized /></a><figcaption>小兵奔跑 · 第一张原始帧<br /><span>直接来自项目素材，保留视频背景。</span></figcaption></figure>
            </div>
          </section>

          <section id="screenshots" className={styles.section} aria-labelledby="screenshots-title">
            <div className={styles.sectionHeading}><span className="section-kicker">03 / FROM THE ACTUAL APP</span><h2 id="screenshots-title">真实桌面测试画面</h2><p>保留 v1.0.0 Windows 便携版的真实奔跑案例截图，说明抠图、对齐与导出流程；当前下载版本为 v1.0.7。点击可打开原图。</p></div>
            <div className={styles.gallery}>{screenshots.map((shot, index) => <figure className={styles.screenshot} key={shot.file}>
              <a href={`${assetRoot}/${shot.file}`} target="_blank" rel="noopener noreferrer" aria-label={`打开${shot.title}原图（新标签页）`}><Image src={`${assetRoot}/${shot.file}`} alt={shot.alt} width={1344} height={shot.height} unoptimized /><span className={styles.expand} aria-hidden="true">↗</span></a>
              <figcaption><div className={styles.shotMeta}><span>便携版实拍 / 0{index + 1}</span><time dateTime="2026-10-11">2026-10-11</time></div><h3>{shot.title}</h3><p>{shot.text}</p></figcaption>
            </figure>)}</div>
            <p className={styles.captionNote}>截图取自项目仓库的 v1.0.0 实拍媒体，沿用此前的奔跑素材，未生成或重绘。示例媒体用于展示工作流程，不作为可再分发的 MIT 素材库。</p>
          </section>

          <section id="getting-started" className={styles.section} aria-labelledby="getting-started-title">
            <div className={styles.startPanel}>
              <div><span className="section-kicker">04 / DOWNLOAD + GET STARTED</span><h2 id="getting-started-title">下载，解压，开始制作</h2><p>v{studioRelease.version} · Windows 64 位便携版 · 约 554 MB。运行时已包含在包内，无需另装 Node.js、Bun 或 Python。</p><a className="candy-button candy-button--secondary" href={studioRelease.downloadUrl} target="_blank" rel="noopener noreferrer">下载 Windows 便携版 <span aria-hidden="true">↗</span><span className="sr-only">（新标签页打开）</span></a><div className={styles.downloadLinks}><a href={studioRelease.releaseUrl} target="_blank" rel="noopener noreferrer">版本说明 ↗</a><a href={studioRelease.guideUrl} target="_blank" rel="noopener noreferrer">完整使用说明 ↗</a><a href={studioRelease.checksumUrl} target="_blank" rel="noopener noreferrer">SHA256 校验文件 ↗</a></div></div>
              <ol><li><strong>下载并解压 ZIP</strong><span>下载 {studioRelease.archiveName}，解压到可写目录；不要直接在压缩包里运行。</span></li><li><strong>双击启动</strong><span>打开 SpriteMotionStudio.exe 或 START.cmd。个人工作区默认保存在 LocalAppData，可通过菜单切换已有工作区；升级时继续选择原工作区，保留源素材与已保存的遮罩。</span></li><li><strong>导入你的第一段素材</strong><span>新建项目，导入视频或 PNG 序列。自动抠图需要通过菜单下载或离线导入 u2netp 模型，模型未随包附带。</span></li></ol>
            </div>
            <p className={styles.captionNote}>便携包无需传统安装；卸载时删除解压目录，个人工作区与模型默认保留。本版程序未签名，已完成本机启动与换目录验证，干净 Windows 虚拟机验收尚未完成。后续版本可在 <a href={studioRelease.latestUrl} target="_blank" rel="noopener noreferrer">最新发布页 ↗</a> 查看。</p>
          </section>

          <section id="roadmap" className={styles.section} aria-labelledby="roadmap-title">
            <div className={styles.sectionHeading}><span className="section-kicker">05 / THE NEXT CHAPTER</span><h2 id="roadmap-title">下一步，走向游戏素材管线</h2><p>抠图、对齐、导出与便携发行已经落地，接下来继续验证实际使用效果。</p></div>
            <div className={styles.roadmap}><div><span>仍需人工验收</span><h3>真实素材质量</h3><p>逐帧检查武器、头发、盾牌和透明边缘，完成动作的美术质量确认。</p></div><div><span>待补充验证</span><h3>干净 Windows 环境</h3><p>已有本机启动、换目录与受限 PATH 验证，继续补充干净虚拟机验收。</p></div><div><span>P6 / 后续阶段</span><h3>Cocos 实际播放</h3><p>导出清单包含画布与锚点信息，Cocos Creator 中的实际接入和播放仍待验证。</p></div></div>
          </section>

          <aside className={styles.origin}><span aria-hidden="true">✳</span><p>本项目基于 <a href="https://github.com/taotao7/FrameBaker" target="_blank" rel="noopener noreferrer">FrameBaker<span className="sr-only">（新标签页打开）</span></a> 二次开发，保留上游历史与 MIT 许可署名。当前版本功能与下载以最新发布说明为准，操作细节见对应版本的使用指南。</p></aside>
        </article>
        <Link prefetch={false} className="back-to-works" href="/tools/"><span aria-hidden="true">←</span> 返回小工具列表</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
