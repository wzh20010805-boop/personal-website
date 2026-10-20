import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { publicAsset } from "@/lib/public-assets";
import styles from "./knowledge.module.css";

const images = publicAsset("/images/agents/personal-knowledge");
const repo = "https://github.com/wzh20010805-boop/personal-knowledge";

export const metadata: Metadata = {
  title: "个人知识库 · 从资料到自己的理解 | 创作空间",
  description: "一个本地运行的 React 与 Python 知识工作台：导入资料、整理摘要、按原文证据问答、定位引用，并由自己确认观点。查看真实界面与学习笔记演示案例。",
};

const features = [
  { title: "先把资料收好", text: "导入 PDF、DOCX、Markdown 和 TXT，保留原文件、正文与可定位片段。按类型、主题和处理状态查找资料；扫描 PDF 需要先经过 OCR。", tag: "01 / COLLECT" },
  { title: "用摘要和标签整理", text: "为资料生成结构化摘要与标签，再按自己的理解修改。界面区分 AI 生成和用户编辑，让整理结果的来源更清楚。", tag: "02 / ORGANIZE" },
  { title: "回答要有资料依据", text: "提问后检索相关片段，核对引用是否确实来自原文。回答附带证据和来源；资料不足时给出拒答状态，而不是强行补出结论。", tag: "03 / ASK WITH EVIDENCE" },
  { title: "点开引用，回到原文", text: "从回答中的资料引用打开右侧工作面板，查看文档标题、段落位置和对应原文。在阅读与追问之间来回核对。", tag: "04 / TRACE BACK" },
  { title: "观点，由自己决定", text: "AI 提出的想法先进入“待确认观点”。接受、编辑后保存或拒绝，由自己做选择，草稿不会自动成为个人的已确认观点。", tag: "05 / REVIEW" },
  { title: "保留对话，按需启用记忆", text: "对话和任务记录保存在本机，刷新后可以回看。Session、跨会话检索和长期记忆按配置启用；记忆候选也需确认，不默认开启。", tag: "06 / CONTINUE" },
];

const shots = [
  { file: "library.png", title: "资料库 · 两份学习笔记", text: "导入“演示-学习计划.md”和“演示-复盘方法.md”，查看摘要、标签与处理状态。资料显示待确认，与观点仍未审核的状态一致。", alt: "个人知识库真实界面，资料库中展示两份演示Markdown笔记、演示摘要、标签与待确认状态" },
  { file: "evidence-answer.png", title: "Agent 对话 · 先看依据", text: "提问“怎样把读过的资料整理成可执行的学习计划？”。演示回答列出两份资料的原文证据，并保留引用入口与局限说明。", alt: "个人知识库Agent对话真实界面，演示学习计划问题、模拟回答与两条资料证据" },
  { file: "source-citation.png", title: "引用定位 · 把原文放在旁边", text: "点击“资料1”后，右侧打开复盘方法的资料详情，定位到对应标题与段落。回答和来源可以并排对照，不必只凭一句 AI 总结。", alt: "点击资料引用后的真实工作台，右侧面板显示演示复盘方法原文、段落位置和引用编号" },
  { file: "viewpoint-review.png", title: "我的观点 · 让草稿停在待确认", text: "两条演示草稿保留在左侧，提供接受、编辑后保存和拒绝入口；右侧已确认观点仍为 0，展示 AI 建议与个人确认之间的边界。", alt: "我的观点真实界面，左侧两条演示待确认观点，右侧暂无已确认观点" },
];

export default function PersonalKnowledgePage() {
  return (
    <div id="top" className={styles.page}>
      <a className="skip-link" href="#content">跳到内容</a>
      <SiteHeader />
      <main id="content" className="category-page page-shell">
        <nav className="breadcrumb" aria-label="面包屑"><Link prefetch={false} href="/">首页</Link><span aria-hidden="true">/</span><Link prefetch={false} href="/agents/">我做的 Agent</Link><span aria-hidden="true">/</span><span aria-current="page">个人知识库</span></nav>
        <article>
          <header className={styles.hero}>
            <div>
              <div className={styles.labels}><span>个人知识 Agent</span><span>持续开发中</span></div>
              <p className="section-kicker">PERSONAL KNOWLEDGE</p>
              <h1>个人<span>知识库</span><i aria-hidden="true">✳</i></h1>
              <p className={styles.tagline}>把散落的资料，<br />变成可追溯的理解。</p>
              <p className={styles.intro}>我做的一个个人知识 Agent。把学习笔记和文档收进来，用摘要与标签整理，再带着问题找回证据。摘要、观点草稿与问答调用 DeepSeek API。AI 帮忙提出线索，引用回到原文，最后的观点由自己确认。</p>
              <div className={styles.actions}><a className="candy-button candy-button--primary" href="#case-study">看看使用案例 <span aria-hidden="true">↘</span></a><a className={styles.textLink} href="#screenshots">浏览真实界面 ↓</a></div>
              <p className={styles.updated}>资料核对于 <time dateTime="2026-10-20">2026.10.20</time> · React + Python · 本地开发版</p>
            </div>
            <figure className={styles.heroVisual}><div className={styles.windowBar}><span aria-hidden="true">● ● ●</span><span>ASK → CHECK → UNDERSTAND</span></div><Image src={`${images}/source-citation.png`} alt="个人知识库真实界面演示：带证据的回答与右侧原文定位面板并排显示" width={1600} height={1100} unoptimized loading="eager" /><figcaption>真实界面 · 演示资料与模拟模型输出</figcaption></figure>
          </header>

          <dl className={styles.facts}><div><dt>适用场景</dt><dd>学习、阅读与资料整理</dd></div><div><dt>核心流程</dt><dd>导入 → 问答 → 引用 → 确认</dd></div><div><dt>模型调用</dt><dd>DeepSeek API</dd></div><div><dt>当前交付</dt><dd>项目展示 · 源码私有</dd></div></dl>
          <aside id="demo-note" className={styles.notice}><strong>关于这些截图</strong><p>截图拍自真实应用，使用独立的演示资料与模拟模型输出，未展示私人笔记，也未调用真实 DeepSeek API。它们说明操作流程，不作为真实模型效果评测。</p></aside>

          <section id="features" className={styles.section} aria-labelledby="features-title"><div className={styles.heading}><span className="section-kicker">01 / A PLACE FOR YOUR KNOWLEDGE</span><h2 id="features-title">从收集，到自己的理解</h2><p>不止存下资料，也保留每次整理和判断的来处。</p></div><div className={styles.features}>{features.map((feature) => <div className={styles.feature} key={feature.tag}><span>{feature.tag}</span><h3>{feature.title}</h3><p>{feature.text}</p></div>)}</div></section>

          <section id="case-study" className={styles.section} aria-labelledby="case-title">
            <div className={styles.heading}><span className="section-kicker">02 / A SMALL LEARNING CASE</span><h2 id="case-title">读完两篇笔记，然后呢？</h2><p>用一组学习与复盘的演示资料，走一遍“读过 → 找到依据 → 形成行动”的流程。</p></div>
            <div className={styles.casePanel}>
              <div><span className={styles.badge}>演示输入 / 2 份 Markdown</span><h3>把学习计划和复盘方法放到一起</h3><ul><li><strong>演示-学习计划.md</strong><p>每次学习后写下三个要点；下次开始前先回忆，再回原文补充遗漏。</p></li><li><strong>演示-复盘方法.md</strong><p>记录目标、实际完成、问题和下一步行动；未核实的结论先保留为待确认观点。</p></li></ul></div>
              <div className={styles.question}><span className={styles.badge}>演示问题</span><blockquote>怎样把读过的资料整理成<br />可执行的学习计划？</blockquote><p><strong>演示回答思路：</strong>整理要点 → 主动回忆 → 复盘 → 下一步行动。</p><p>两条引用分别指向示例笔记的原文段落。点击引用后打开资料面板，再由自己判断是否保留观点。</p><small>问题、资料与回答均为公开展示专门准备的演示内容。</small></div>
            </div>
            <ol className={styles.steps}><li><span>01</span><h3>导入并整理</h3><p>保存资料，查看摘要、标签和处理状态。</p></li><li><span>02</span><h3>带着问题查找</h3><p>从已有资料检索证据，组织带来源的回答。</p></li><li><span>03</span><h3>回到原文核对</h3><p>点开引用，在工作面板确认具体段落。</p></li><li><span>04</span><h3>自己确认观点</h3><p>接受、修改或拒绝草稿，保留判断过程。</p></li></ol>
          </section>

          <section id="screenshots" className={styles.section} aria-labelledby="screenshots-title"><div className={styles.heading}><span className="section-kicker">03 / INSIDE THE WORKSPACE</span><h2 id="screenshots-title">四个真实界面，一次演示流程</h2><p>完整保留界面比例，点击可打开原图。</p></div><div className={styles.gallery}>{shots.map((shot, index) => <figure className={styles.shot} key={shot.file}><a href={`${images}/${shot.file}`} target="_blank" rel="noopener noreferrer" aria-label={`打开${shot.title}原图（新标签页）`}><Image src={`${images}/${shot.file}`} alt={shot.alt} width={1600} height={1100} unoptimized /><span aria-hidden="true">↗</span></a><figcaption><div className={styles.shotMeta}><span>演示案例 / 0{index + 1}</span><time dateTime="2026-10-20">2026-10-20</time></div><h3>{shot.title}</h3><p>{shot.text}</p></figcaption></figure>)}</div><p className={styles.caption}>真实 React 界面与 Python API 在隔离目录运行；资料、摘要及回答为演示数据，原文引用交互经过实际操作验证。</p></section>

          <section id="workflow" className={styles.section} aria-labelledby="workflow-title">
            <div className={styles.heading}><span className="section-kicker">04 / ARCHIFY WORKFLOW</span><h2 id="workflow-title">一次提问，怎样回到可靠的来源</h2><p>复用本地项目已有的 Archify 问答流程图：从 React 对话页进入任务，再由问答引擎检索证据、核验引用，返回可查看来源的回答。</p></div>
            <figure className={styles.workflowFigure}><a href={publicAsset("/diagrams/personal-knowledge-workflow.html")} target="_blank" rel="noopener noreferrer" aria-label="打开 Archify 交互流程图（新标签页）"><Image src={publicAsset("/images/agents/personal-knowledge/workflow.png")} alt="Archify 问答流程图：React 对话页、FastAPI、持久任务、AnswerService、legacy 或 Agent 引擎、rag_search 检索、引用核验与回答展示" width={1870} height={861} unoptimized /></a><figcaption><strong>Archify · 本地项目原有问答流程</strong><a className={styles.textLink} href={publicAsset("/diagrams/personal-knowledge-workflow.html")} target="_blank" rel="noopener noreferrer">打开交互流程图 ↗</a></figcaption></figure>
            <p className={styles.caption}>模型生成使用 DeepSeek API；BGE 嵌入和资料存储在本机。流程图保留原项目的引擎区分：默认固定 RAG，按配置启用 Agent 模型决策与 rag_search 工具调用。资料导入和观点审核使用独立流程。</p>
          </section>

          <section id="data-boundary" className={styles.section} aria-labelledby="boundary-title"><div className={styles.heading}><span className="section-kicker">05 / LOCAL DATA, EXPLICIT AI CALLS</span><h2 id="boundary-title">资料在本机，模型调用要分清</h2></div><div className={styles.boundaries}><div><h3>本地保存的内容</h3><p>原始文件、资料库、向量索引、观点与对话记录保存在本机。嵌入模型首次下载后在本机计算。</p></div><div><h3>需要模型处理的内容</h3><p>摘要与问答使用配置的 DeepSeek API，会发送用于处理的资料正文或检索片段；启用记忆时，选入上下文的已确认记忆也会发送。它不是完全离线的 AI 工具。</p></div></div></section>

          <section id="project-status" className={styles.section} aria-labelledby="status-title"><div className={styles.statusPanel}><div><span className="section-kicker">06 / WORK IN PROGRESS</span><h2 id="status-title">一个持续打磨的个人项目</h2><p>当前为本地源码工作台，使用 React、TypeScript 与 Python。基础资料流程之外，资料知识页、会话检索和长期记忆等能力仍按开发进度与配置逐步验证。</p><a className={styles.textLink} href={repo} target="_blank" rel="noopener noreferrer">项目仓库（需访问权限） ↗</a></div><div><h3>当前访问方式</h3><p>源码仓库为私有，尚未提供公开安装包或在线问答服务。获得源码访问权限后，可按项目 README 准备 Python、前端环境、模型与自己的 API 配置，在本机运行。</p><p>本页只展示作品与演示案例，不连接或开放我的个人知识库。</p></div></div></section>
        </article>
        <Link prefetch={false} className="back-to-works" href="/agents/"><span aria-hidden="true">←</span> 返回 Agent 列表</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
