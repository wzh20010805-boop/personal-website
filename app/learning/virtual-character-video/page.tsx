import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { publicAsset } from "@/lib/public-assets";
import styles from "./video.module.css";

export const metadata: Metadata = {
  title: "从立绘到 Live2D：虚拟角色视频制作记 | 创作空间",
  description: "三条真实成片，记录奶糖喵从序列帧动画到 Live2D 参数模型的制作过程：分层、动作、换装、配音与字幕、Remotion 编排，以及 FFmpeg 视频导出。",
};

const mediaRoot = "/videos/learning/virtual-character";
const imageRoot = "/images/learning/virtual-character";

const stages = [
  { number: "01", tool: "素材整理", title: "先让角色保持一致", text: "早期自我介绍从正式六动作素材包开始，整理 822 帧素材，并补入专门的向左行走素材，避免直接镜像把配饰翻到另一边。对齐人物比例与脚底锚点，检查透明边缘和动作衔接；素材帧负责姿态，画面中的位置另由代码控制。" },
  { number: "02", tool: "PSD → PSD2Live", title: "把一张图，拆成可控制的部分", text: "进入 Live2D 阶段后，把头发、脸、五官、身体、服饰与手臂分开处理。在 PSD2Live 中建立网格、变形层级和参数，让转头、眨眼、抬手能够分别调整，再组合成完整动作。" },
  { number: "03", tool: "动作与外观", title: "给每个动作一个完整的起落", text: "将肩、肘、腕与身体姿态写入动作曲线，检查抬手、停留和放下的连续过程。女仆装、冬装使用独立的服饰参数；表情与手型也保留自己的控制通道，避免换装时把动作重新播放一遍。" },
  { number: "04", tool: "声音与字幕", title: "用真实音频确定节奏", text: "先确定文案和配音，再根据音频安排字幕与表演。早期自我介绍用 MiniMax 生成八段口播；展示片原版使用已选声线的三句口播，配上由 Python 合成的背景乐《蓝色小潮汐》。10 月 31 日更新只改画面，沿用完整音轨。" },
  { number: "05", tool: "Remotion", title: "把所有内容放到同一条时间轴", text: "角色、标题、内容卡、字幕和声音分别组织。最新展示片由 timeline.json 的 chapters 安排动作章节，由 outfits 安排换装；Remotion 依据当前帧发送对应时间，等角色画面渲染完成后再收集这一帧。" },
  { number: "06", tool: "FFmpeg 与复核", title: "导出之后，仍要回到画面里检查", text: "以 1920×1080、30 fps 输出画面，用 FFmpeg 封装 MP4。最新展示片直接复制上一版 AAC 音轨；完成后进行完整解码、关键时刻抽帧，并检查动作起落、衣装遮挡和字幕时间。" },
];

const problems = [
  { title: "抬手时，袖子和手掌会穿过身体", label: "形体与遮挡", text: "围绕肩、肘、腕做局部绑定与连续权重调整，将袖子按肩根后层与前臂前层组织。分别检查两套服饰中的抬手与放下，而不是只确认正面待机好看。最新版本继续修正了手臂形变与手势。" },
  { title: "拖回时间轴，同一帧却长得不一样", label: "可重复渲染", text: "物理按固定 60 Hz 推进，视频按 30 fps 取画面；重复请求同一帧时只重绘，向后定位时重置状态并做 90 步预热。这样 Remotion 调整渲染顺序时，角色仍能回到对应时刻。" },
  { title: "换装时出现半套衣服叠在一起", label: "独立状态", text: "换装时间独立于动作时间。服饰、手型与虹膜样式按离散状态切换，避免把两个素材状态插值混在一起；只改变衣装参数，不重启动作，换装后继续当前表演。" },
  { title: "有背景音乐，嘴巴就一直在动", label: "口播驱动", text: "从单独口播音轨提取 RMS 音量包络，平滑张嘴与闭嘴的响应；背景音乐不参与嘴型计算。它表现说话的强弱与停顿，并不等同于按每个音素匹配嘴型。" },
];

const projectFiles = [
  { file: "character_arm_gestures.psd2live", purpose: "可编辑角色工程：分层、网格、变形器、参数、动作与物理设置。" },
  { file: "model3.json / moc3 / motion3.json", purpose: "运行资源：模型入口、编译后的角色、贴图引用和动作曲线，供浏览器中的 Cubism 播放。" },
  { file: "timeline.json", purpose: "表演安排：章节、动作和换装时间，让预览与视频使用同一份编排。" },
  { file: "renderer.js / Live2DShowcase.tsx", purpose: "渲染衔接：浏览器绘制真实角色模型，Remotion 按帧号驱动并等待完成。" },
  { file: "render-showcase.cjs", purpose: "导出入口：渲染更新画面，再调用 FFmpeg 复用已有音轨。" },
];

function VideoPlayer({ file, poster, title }: { file: string; poster: string; title: string }) {
  return (
    <video className={styles.video} controls playsInline preload="none" poster={publicAsset(`${imageRoot}/${poster}`)} aria-label={title}>
      <source src={publicAsset(`${mediaRoot}/${file}`)} type="video/mp4" />
      <track kind="captions" src={publicAsset(`${mediaRoot}/${file.replace(/\.mp4$/, ".vtt")}`)} srcLang="zh" label="中文字幕" />
      你的浏览器暂时无法播放这段视频，可以<a href={publicAsset(`${mediaRoot}/${file}`)}>直接打开 MP4</a>。
    </video>
  );
}

export default function VirtualCharacterVideoPage() {
  return (
    <div className={styles.page} id="top">
      <a className="skip-link" href="#content">跳到内容</a>
      <SiteHeader />
      <main id="content" className="category-page page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <Link prefetch={false} href="/">首页</Link><span aria-hidden="true">/</span>
          <Link prefetch={false} href="/learning/">我的学习与技术积累</Link><span aria-hidden="true">/</span>
          <span aria-current="page">虚拟角色视频制作记</span>
        </nav>

        <article>
          <header className={styles.hero}>
            <div>
              <div className={styles.labels}><span>创作实践 · 制作复盘</span><time dateTime="2026-10-31">2026.10.31</time></div>
              <p className={styles.english}>CHARACTER / MOTION / STORY</p>
              <h1>从立绘到 Live2D<span>虚拟角色视频制作记</span></h1>
              <p className={styles.tagline}>让角色动起来，<br />也让她把故事讲清楚。</p>
              <p className={styles.intro}>从一段自我介绍，到跟着时间轴表演、换装的 Live2D 展示片。我把三条成片放在这里，也把素材、动作、声音与代码是怎样接起来的记录下来。</p>
              <div className={styles.actions}><a className="candy-button candy-button--primary" href="#videos">先看成片 <span aria-hidden="true">↘</span></a><a className={styles.textLink} href="#workflow">看看怎么做的 <span aria-hidden="true">→</span></a></div>
            </div>
            <figure className={styles.heroVisual}>
              <div className={styles.windowBar}><span aria-hidden="true">● ● ●</span><span>最新成片 / LIVE2D SHOWCASE</span><span>01:00</span></div>
              <a href="#videos" aria-label="前往观看最新 Live2D 展示片"><Image src={publicAsset(`${imageRoot}/showcase.webp`)} alt="最新 Live2D 展示片的真实画面：蓝发角色的服饰、表情与动作展示" width={1280} height={720} unoptimized loading="eager" /></a>
              <figcaption>真实成片截帧 <span>女仆装 × 冬装</span></figcaption>
            </figure>
          </header>

          <dl className={styles.facts}><div><dt>成片记录</dt><dd>3 条，从介绍到展示</dd></div><div><dt>两条动画路线</dt><dd>序列帧 / Live2D 参数</dd></div><div><dt>最新影片规格</dt><dd>1080p · 30 fps · 60 秒</dd></div></dl>
          <nav className={styles.contents} aria-label="文章目录"><a href="#videos">01 成片</a><a href="#routes">02 动画路线</a><a href="#workflow">03 制作流程</a><a href="#lessons">04 遇到的问题</a><a href="#files">05 工程组织</a></nav>

          <section id="videos" className={styles.section} aria-labelledby="videos-title">
            <div className={styles.sectionHeading}><span className="section-kicker">01 / WATCH THE FILMS</span><h2 id="videos-title">先看结果，再拆开过程</h2><p>三条影片保留了不同阶段的尝试。点击播放即可观看，视频中已有中文字幕；播放器也提供可选字幕轨道。</p></div>
            <div className={styles.featuredFilm}>
              <div className={styles.filmBar}><span>最新版本</span><span>2026.10.31 · 60 秒</span></div>
              <VideoPlayer file="live2d-showcase-20261031.mp4" poster="showcase.webp" title="Live2D 角色展示片，2026年10月31日动作更新版" />
              <div className={styles.filmBody}><div className={styles.filmHeading}><h3>每一面，都很可爱 · Live2D 展示片</h3><a className={styles.textLink} href={publicAsset(`${mediaRoot}/live2d-showcase-20261031.mp4`)} download>下载视频 <span aria-hidden="true">↓</span></a></div><p>使用真实 MOC3 模型，展示挥手、双手叉腰、欢呼、害羞和歪头，以及女仆装与冬装的切换。最新版本更新动作和手臂表现，声音沿用上一版。</p><div className={styles.tags}><span>48 个模型参数</span><span>独立换装时间轴</span><span>真实模型逐帧渲染</span></div></div>
            </div>
            <div className={styles.filmGrid}>
              <div className={styles.film}>
                <VideoPlayer file="introduction-v4.mp4" poster="introduction.webp" title="奶糖喵自我介绍，序列帧动画第四版" />
                <div className={styles.filmBody}><span className={styles.filmMeta}>阶段一 / 约 2 分钟 / 序列帧动画</span><h3>奶糖喵，先来认识一下</h3><p>角色的自我介绍，也是最初的制作练习。把说话、行走、指向等动作素材与口播编排到一起，先解决人物一致性、走位和字幕节奏。</p><a className={styles.textLink} href={publicAsset(`${mediaRoot}/introduction-v4.mp4`)} download>下载自我介绍 <span aria-hidden="true">↓</span></a></div>
              </div>
              <div className={styles.film}>
                <VideoPlayer file="sprite-motion-studio-live2d-v1.mp4" poster="studio.webp" title="Sprite Motion Studio 工具介绍，Live2D 角色讲解版" />
                <div className={styles.filmBody}><span className={styles.filmMeta}>阶段二 / 约 41 秒 / LIVE2D 讲解</span><h3>让角色介绍自己用过的工具</h3><p>用 Live2D 角色讲解 Sprite Motion Studio，将角色表演、工具内容与字幕放进同一段视频。这是从素材动画走向参数化角色的一个中间阶段。</p><a className={styles.textLink} href={publicAsset(`${mediaRoot}/sprite-motion-studio-live2d-v1.mp4`)} download>下载工具介绍 <span aria-hidden="true">↓</span></a></div>
              </div>
            </div>
          </section>

          <section id="routes" className={styles.section} aria-labelledby="routes-title">
            <div className={styles.sectionHeading}><span className="section-kicker">02 / TWO WAYS TO ANIMATE</span><h2 id="routes-title">同一个角色，两条动画路线</h2><p>第一条影片主要播放已有动作帧，后来的影片开始驱动角色模型。两种方法需要解决的问题也不同。</p></div>
            <div className={styles.routeGrid}>
              <div className={styles.routeCard}><span className={styles.routeLabel}>A / 序列帧</span><h3>把动作素材按时间播出来</h3><ol><li>动作视频 / 透明 PNG 帧</li><li>抽帧、抠图检查与脚底对齐</li><li>按帧选择姿态，另行控制走位</li><li>Remotion 合成场景与字幕</li></ol><p>适合沿用已经做好的动作。增加一个新动作，通常要补对应的素材；素材里的步态与屏幕上的移动速度还要配合。</p></div>
              <div className={styles.routeCard}><span className={styles.routeLabel}>B / LIVE2D</span><h3>用参数让分层立绘表演</h3><ol><li>分层 PSD / 角色部件</li><li>网格、变形器、参数与动作曲线</li><li>Cubism 运行模型 + 物理与外观状态</li><li>按时间采样，交给 Remotion 出片</li></ol><p>可以独立控制转头、眨眼、手臂和衣装。自由度增加后，更要检查变形连接、图层遮挡与动作之间的衔接。</p></div>
            </div>
          </section>

          <section id="workflow" className={styles.section} aria-labelledby="workflow-title">
            <div className={styles.sectionHeading}><span className="section-kicker">03 / FROM ASSETS TO A FILM</span><h2 id="workflow-title">我是怎样把这些部分接起来的</h2><p>先把每一部分做成可修改的素材，再让它们围绕同一段内容和时间工作。</p></div>
            <figure className={styles.partsFigure}>
              <div className={styles.partsImage}><Image src={publicAsset(`${imageRoot}/parts.webp`)} alt="早期角色局部拆件示例：头发、面部、五官、服饰等部件分别保留，供后续分层与变形处理" width={1280} height={960} unoptimized /></div>
              <figcaption><span className="section-kicker">ARTWORK / LAYERS</span><h3>分层，是独立控制的起点</h3><p>让头发可以跟随头部，让五官可以做表情，让袖子可以抬起来，前提是给这些部件留下独立的素材与控制关系。</p><p className={styles.figureNote}>图为工程中的早期局部拆件示例，用来说明素材组织方式；不是最新角色的完整分层清单。</p></figcaption>
            </figure>
            <ol className={styles.workflow}>{stages.map(stage => <li key={stage.number}><div className={styles.stepNumber}>{stage.number}</div><div><span className={styles.stepTool}>{stage.tool}</span><h3>{stage.title}</h3><p>{stage.text}</p></div></li>)}</ol>
          </section>

          <section id="lessons" className={styles.section} aria-labelledby="lessons-title">
            <div className={styles.sectionHeading}><span className="section-kicker">04 / THE DETAILS THAT MATTER</span><h2 id="lessons-title">真正花时间的，是这些细节</h2><p>能动只是开始。要让预览、导出和不同服饰里的表现一致，还需要逐项修正。</p></div>
            <div className={styles.lessonGrid}>{problems.map(problem => <div className={styles.lesson} key={problem.label}><span>{problem.label}</span><h3>{problem.title}</h3><p>{problem.text}</p></div>)}</div>
            <aside className={styles.takeaway}><span aria-hidden="true">✳</span><p>这次实践留下的方法：<strong>把素材、参数、动作时间和画面位置分开管理。</strong>修改手臂时保留声音，调整衣装时保留表演，换一段文案时仍能复用角色。</p></aside>
          </section>

          <section id="files" className={styles.section} aria-labelledby="files-title">
            <div className={styles.sectionHeading}><span className="section-kicker">05 / INSIDE THE PROJECT</span><h2 id="files-title">让下一次修改，有地方落笔</h2><p>下面是实际工程中各类文件的分工。这篇文章公开成片与制作方法，未打包发布完整编辑工程。</p></div>
            <dl className={styles.fileList}>{projectFiles.map(file => <div key={file.file}><dt><code>{file.file}</code></dt><dd>{file.purpose}</dd></div>)}</dl>
            <div className={styles.related}><div><span className="section-kicker">KEEP MAKING</span><h3>素材工具和网页伙伴，也在继续生长</h3><p>成片把一次表演固定下来；网页里的伙伴则实时响应鼠标、动作与换装选择。两者复用角色资源，分别处理视频时间轴和网页交互。</p></div><Link className="candy-button candy-button--secondary" prefetch={false} href="/tools/sprint-motion-studio/">看看素材创意工坊 <span aria-hidden="true">↗</span></Link></div>
          </section>
        </article>
        <Link prefetch={false} className="back-to-works" href="/learning/"><span aria-hidden="true">←</span> 返回学习与技术积累</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
