import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./radar.module.css";

export const metadata: Metadata = {
  title: "Amazon Product Radar · Amazon 选品机会雷达 | 创作空间",
  description: "一个辅助 Amazon 选品判断的私人 AI Skill。了解候选发现、推荐理由、评分、风险与证据来源，并查看 2026-09-14 的真实历史报告样例。",
};

const workflow = ["市场 / 类目选择", "候选发现", "异常信号分析", "商业价值分析", "国内采购可获得性", "风险扫描", "推荐理由 + 评分 + 证据", "人工最终判断"];
const problems = [
  { title: "发现候选机会", text: "从目标市场与类目中寻找值得进一步分析的商品，而不是只展示已经成熟的热门商品。" },
  { title: "解释为什么值得关注", text: "不只输出一个分数，同时展示推荐理由、评分拆解、主要风险和证据来源。" },
  { title: "保留人工决策", text: "Skill 负责发现、分析与解释，不替用户自动下单或决定是否进入市场。" },
];
const risks = ["知识产权", "Amazon 平台合规", "法规与认证", "危险品 / 电池", "产品安全责任", "FBA 与物流", "退货与售后", "需求真实性", "供应链与质量", "市场与品牌风险"];

// Original user-supplied screenshots, displayed without cropping or optimization.
const screenshots = {
  "report-overview": { width: 1009, height: 505, alt: "2026-09-14 历史报告总览：JP 市场、2 类目、4 个合格机会、11 个校验候选，以及市场、类目和排序入口" },
  "product-opportunity-card": { width: 778, height: 893, alt: "历史商品机会卡：商品图与推荐结论、机会评分 32.18/100、证据置信系数 70%，最大单点风险为需求真实性" },
  "recommendation-reasons": { width: 960, height: 840, alt: "历史报告推荐理由：推荐结论、当时的机会信号、商业价值，以及先做材料与生命周期验证的 AI ESTIMATE 判断" },
  "recommendation-score": { width: 1005, height: 607, alt: "历史推荐评分拆解：异常信号 21.5/40、商业价值 28.9/45、国内采购 7/15，总机会评分 32.18/100，证据置信系数 70%" },
  "risk-analysis": { width: 936, height: 711, alt: "历史报告风险与反方观点：知识产权、平台合规、法规认证、物流、售后、需求真实性等十个风险维度" },
  "evidence-sources": { width: 935, height: 710, alt: "历史报告信息来源与证据：Amazon Japan 新品榜、外部内容、Amazon 商品详情、Alibaba China 供应端目录及完整引用集合" },
};

function Screenshot({ name, caption }: { name: keyof typeof screenshots; caption: string }) {
  const shot = screenshots[name];
  return (
    <figure className={styles.screenshot}>
      <div className={styles.imageFrame}>
        <Image src={`/images/skills/amazon-product-radar/${name}.png`} alt={shot.alt} width={shot.width} height={shot.height} unoptimized />
      </div>
      <figcaption><span>历史案例 · 2026-09-14</span>{caption}</figcaption>
    </figure>
  );
}

function SectionHeading({ number, eyebrow, title, children }: { number: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.sectionNumber} aria-hidden="true">{number}</span>
      <div><span className="section-kicker">{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>
    </div>
  );
}

export default function AmazonProductRadarPage() {
  return (
    <div id="top" className={styles.page}>
      <a className="skip-link" href="#content">跳到内容</a>
      <SiteHeader />
      <main id="content" className="category-page page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <Link prefetch={false} href="/">首页</Link><span aria-hidden="true">/</span>
          <Link prefetch={false} href="/skills/">我做的 Skill</Link><span aria-hidden="true">/</span>
          <span aria-current="page">Amazon Product Radar</span>
        </nav>

        <article>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <div className={styles.labels}><span>PRIVATE PROJECT</span><span>AI SKILL</span></div>
              <p className={styles.chineseTitle}>Amazon 选品机会雷达</p>
              <h1>Amazon<br />Product Radar<span aria-hidden="true">✳</span></h1>
              <p className={styles.subtitle}>从真实商品与证据出发，寻找今天值得进一步研究的 Amazon 选品机会。</p>
              <p className={styles.introduction}>我为 Amazon 选品场景设计的一套机会发现 Skill。它不是简单地列出热销商品，而是围绕候选发现、异常信号、商业价值、国内采购、风险与证据来源，生成一份可解释的研究报告，辅助人工做最终判断。</p>
            </div>
            <div className={styles.heroArt} aria-hidden="true">
              <span className={styles.artCaption}>FOLLOW THE EVIDENCE</span>
              <svg viewBox="0 0 300 300" fill="none">
                <circle cx="150" cy="150" r="132" fill="var(--paper-light)" stroke="currentColor" strokeWidth="3" />
                <circle cx="150" cy="150" r="95" stroke="currentColor" strokeWidth="2" strokeDasharray="4 7" />
                <circle cx="150" cy="150" r="54" stroke="currentColor" strokeWidth="2" />
                <path d="M150 18v264M18 150h264" stroke="currentColor" strokeWidth="2" />
                <path d="M150 150 249 62A132 132 0 0 1 280 174Z" fill="var(--tool)" fillOpacity=".45" stroke="currentColor" strokeWidth="2" />
                <circle cx="150" cy="150" r="11" fill="var(--agent)" stroke="currentColor" strokeWidth="3" />
                <circle cx="204" cy="104" r="9" fill="var(--prompt)" stroke="currentColor" strokeWidth="3" />
                <circle cx="79" cy="184" r="8" fill="var(--learning)" stroke="currentColor" strokeWidth="3" />
                <circle cx="214" cy="224" r="7" fill="var(--skill)" stroke="currentColor" strokeWidth="3" />
              </svg>
              <span className={styles.artNote}>发现机会，也看见风险。</span>
              <span className={styles.artFooter}>发现 → 分析 → 人工判断</span>
            </div>
            <p className={styles.privateNote}><span aria-hidden="true">🔒</span> 本项目目前为私人项目。此页面仅展示产品思路与实际效果，源码和仓库不公开。</p>
          </header>

          <section className={`${styles.section} ${styles.originSection}`} aria-label="为什么我会做这个 Skill">
            <SectionHeading number="01" eyebrow="THE ORIGIN" title="为什么我会做这个 Skill" />
            <div className={styles.originStory}>
              <div className={styles.originCopy}>
                <p className={styles.originLead}>这个思路灵感来源于我的一位做亚马逊电商的亲戚。他是一个人做电商，但是由于没有专业的分析选品能力，所以问我能不能帮他做一个关于如何选品的skill，帮助他选一些好的产品来上线到亚马逊上。关于amazon-product-radar选品评分系统与逻辑的markdown文档在我的GitHub仓库中，这里不方便展示，尽情谅解。</p>
              </div>

              <blockquote className={styles.originQuote}>
                <div className={styles.quoteIcon} aria-hidden="true">
                  <svg viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="25" stroke="currentColor" strokeWidth="3" />
                    <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" />
                    <path d="M32 7v7M32 50v7M7 32h7M50 32h7M32 32 48 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="32" cy="32" r="4" fill="var(--agent)" stroke="currentColor" strokeWidth="2" />
                    <path d="M44 11c7 2 10 6 11 13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <span className={styles.quoteLabel}>最初的问题</span>
                <p>
                  <span className={styles.quoteLine}>“能不能帮我做一个 Skill，</span>
                  <span className={styles.quoteLine}>帮我看看 Amazon 上有哪些</span>
                  <span className={styles.quoteLine}>值得做的产品？”</span>
                </p>
                <footer>来自一位个人 Amazon 卖家的真实需求</footer>
              </blockquote>
            </div>

            <ol className={styles.originReasons} aria-label="为什么这件事值得做">
              <li>
                <span className={styles.originReasonIndex}>01</span>
                <h3>个人卖家的信息压力</h3>
                <p>一个人经营店铺，很难同时拥有专业的数据分析、市场研究和持续选品能力。</p>
              </li>
              <li>
                <span className={styles.originReasonIndex}>02</span>
                <h3>选品不应该只靠感觉</h3>
                <p>热销榜只能告诉你已经发生了什么，真正困难的是判断哪些需求值得进一步研究。</p>
              </li>
              <li>
                <span className={styles.originReasonIndex}>03</span>
                <h3>AI 应该辅助判断，而不是替人做决定</h3>
                <p>让 Skill 帮忙整理证据、评分和风险，把最后的商业判断留给使用者。</p>
              </li>
            </ol>

            <aside className={styles.originPrivate} aria-label="评分系统与运行逻辑的私有说明">
              <span className={styles.privateMark} aria-hidden="true">PRIVATE</span>
              <div>
                <h3>评分系统与运行逻辑</h3>
                <p>Amazon Product Radar 内部还有一套完整的选品评分系统与运行逻辑，用于处理候选发现、证据校验、机会评分、风险分析和结果排序。相关 Markdown 文档与具体实现目前保存在我的私人项目中。由于其中包含较完整的内部规则与评分细节，这里暂不公开展示，敬请谅解。</p>
              </div>
            </aside>
          </section>

          <section className={styles.section} aria-label="它解决什么问题">
            <SectionHeading number="02" eyebrow="THE IDEA" title="它解决什么问题" />
            <div className={styles.problemGrid}>
              {problems.map((problem, index) => <div className={styles.problemCard} key={problem.title}><span className={styles.cardIndex}>0{index + 1}</span><h3>{problem.title}</h3><p>{problem.text}</p></div>)}
            </div>
          </section>

          <section className={styles.section} aria-label="工作流程">
            <SectionHeading number="03" eyebrow="HOW IT WORKS" title="把线索，整理成有依据的判断">从市场与类目出发，把发现、分析和复核串成一条清晰的研究路径。</SectionHeading>
            <ol className={styles.workflow} aria-label="工作流程">
              {workflow.map((step, index) => <li key={step}><span className={styles.stepIndex}>0{index + 1}</span><strong>{step}</strong>{index < workflow.length - 1 && <span className={styles.stepArrow} aria-hidden="true">↓</span>}</li>)}
            </ol>
          </section>

          <div className={styles.caseStudy}>
            <header className={styles.historyNote}>
              <div><span className="section-kicker">FROM A REAL REPORT / 历史案例</span><h2>真实历史报告样例</h2><p>以下内容用于展示 Skill 的分析结构和界面效果，不代表当前实时选品推荐。</p></div>
              <span className={styles.dateStamp}><small>REPORT DATE</small><time dateTime="2026-09-14">2026-09-14</time><small>JP · 日本市场</small></span>
            </header>

            <section className={styles.section} aria-label="报告总览">
              <SectionHeading number="04" eyebrow="REPORT OVERVIEW" title="一次分析，一份完整报告">Skill 会把某次选品分析整理成统一报告，而不是把零散网页和模型回答堆在一起。市场、类目和排序入口让整份分析有迹可循。</SectionHeading>
              <Screenshot name="report-overview" caption="报告总览 · 统一呈现本轮分析与候选机会" />
            </section>

            <section className={styles.section} aria-label="商品机会卡">
              <SectionHeading number="05" eyebrow="OPPORTUNITY CARD" title="先看懂一个机会，再决定是否深挖">每个候选商品先以机会卡呈现，包括商品图、市场 / 类目、推荐结论、机会评分、证据置信度以及最大的单点风险。</SectionHeading>
              <div className={styles.opportunityLayout}>
                <Screenshot name="product-opportunity-card" caption="商品机会卡 · 示例报告数据" />
                <aside className={styles.exampleCard}>
                  <span className={styles.exampleLabel}>示例报告数据</span>
                  <h3>一张卡片，先回答三个问题</h3>
                  <dl className={styles.metrics}>
                    <div><dt>机会评分</dt><dd>32.18 <small>/ 100</small></dd></div>
                    <div><dt>证据置信系数</dt><dd>70%</dd></div>
                    <div><dt>最大单点风险</dt><dd className={styles.riskValue}>需求真实性</dd></div>
                  </dl>
                  <p>这是 2026-09-14 报告中的需求机会评分，不代表当前商品质量或成功概率。</p>
                </aside>
              </div>
            </section>

            <section className={styles.section} aria-label="推荐理由">
              <SectionHeading number="06" eyebrow="RECOMMENDATION REASONS" title="把“为什么”写在结论旁边">从触发关注的信号，到可探索的商业价值，再到需要先验证的问题，推荐理由都与本次历史报告的上下文放在一起。</SectionHeading>
              <Screenshot name="recommendation-reasons" caption="推荐理由 · 以下为历史样例中的分析与 AI 判断" />
              <div className={styles.reasonGrid}>
                <div><h3>推荐结论</h3><p>本轮最适合低成本打样的机会，优先解决干硬、异味和尺寸适配。</p></div>
                <div><h3>为什么是今天 <small>（报告当日）</small></h3><p>两个低评论 ASIN 最近进入 JP 家居新品榜前 20，近期日本内容再次验证百叶窗、窗槽和踢脚线湿式除尘场景。</p></div>
                <div><h3>商业价值</h3><p>轻小、非电器、供应成熟，可通过槽型、密度、颜色、握持尺寸、干湿恢复和收纳方式差异化。</p></div>
              </div>
              <aside className={styles.aiNote}><span>AI ESTIMATE / AI 判断</span><p>L3 候选，先做材料与生命周期验证，不宜直接下单。</p><small>历史报告中的 AI 判断，仍需人工核实，不作为已证实事实。</small></aside>
            </section>

            <section className={styles.section} aria-label="推荐评分">
              <SectionHeading number="07" eyebrow="EXPLAINABLE SCORE" title="一个评分，拆开来看">把评分拆成可理解的维度，让每一项依据都能被检查。</SectionHeading>
              <Screenshot name="recommendation-score" caption="推荐评分 · 示例报告数据，保留原始评分结果" />
              <div className={styles.scoreSummary}>
                <table className={styles.scoreTable}><caption>历史样例 · 示例报告数据</caption><thead><tr><th scope="col">维度</th><th scope="col">分值</th></tr></thead><tbody><tr><th scope="row">异常信号</th><td>21.5 / 40</td></tr><tr><th scope="row">商业价值</th><td>28.9 / 45</td></tr><tr><th scope="row">国内采购</th><td>7 / 15</td></tr></tbody></table>
                <div className={styles.scoreNote}><span className={styles.exampleLabel}>示例报告数据</span><p>总机会评分 <strong>32.18 / 100</strong><br />证据置信系数 <strong>70%</strong></p><p>评分对象是“需求机会”，不等同于商品质量、Amazon 星级或成功概率。</p></div>
              </div>
            </section>

            <section className={styles.section} aria-label="风险与反方观点">
              <SectionHeading number="08" eyebrow="RISKS & COUNTERPOINTS" title="支持的理由，反对的声音，都要看见">Skill 也会主动输出反方观点和风险。风险扫描用于标记和解释风险，不自动替用户淘汰商品。</SectionHeading>
              <Screenshot name="risk-analysis" caption="风险与反方观点 · 历史报告中的风险扫描" />
              <ul className={styles.riskTags} aria-label="风险扫描维度">{risks.map(risk => <li key={risk}>{risk}</li>)}</ul>
              <p className={styles.riskNote}><span aria-hidden="true">!</span><strong>未评估不代表低风险。</strong> 需要复核的问题，留给后续研究和人工判断。</p>
            </section>

            <section className={styles.section} aria-label="信息来源与证据">
              <SectionHeading number="09" eyebrow="SOURCES & EVIDENCE" title="让每一个推荐，都有迹可循">每个推荐都尽可能保留可回溯的信息来源，让用户能够自行打开来源复核，而不是只能相信模型的一句话。</SectionHeading>
              <Screenshot name="evidence-sources" caption="信息来源与证据 · 展示历史引用结构" />
              <div className={styles.sourceSummary}><h3>历史样例中的来源类型</h3><ul><li>Amazon Japan New Releases</li><li>外部评测 / 内容证据</li><li>Amazon 商品详情页</li><li>Alibaba China 供应端目录</li><li>完整证据与引用集合</li></ul></div>
            </section>
          </div>
          <footer className={styles.closing}><span className="section-kicker">RESEARCH WITH EVIDENCE</span><p>让 AI 帮忙发现与解释，<br /><strong>把最终判断留给人。</strong></p><span>私人项目 · 源码暂不公开</span></footer>
        </article>
        <nav className={styles.returnLinks} aria-label="返回导航"><Link prefetch={false} className="back-to-works" href="/skills/"><span aria-hidden="true">←</span> 返回 Skill 列表</Link><Link prefetch={false} className="back-to-works" href="/#works">返回首页 / 创作抽屉 <span aria-hidden="true">↗</span></Link></nav>
      </main>
      <SiteFooter />
    </div>
  );
}
