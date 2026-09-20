import Image from "next/image";
import { site } from "@/data/site";
import { CandyButton } from "./CandyButton";

export function HeroSection() {
  return (
    <section className="hero page-shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="hero-eyebrow"><span aria-hidden="true">✳</span>{site.identity}</span>
        <h1 id="hero-title">{site.title.firstLine}<br />{site.title.secondLine}<span className="hero-highlight">{site.title.highlight}</span><span className="hero-title-dot" aria-hidden="true">。</span></h1>
        <p className="hero-description">{site.description}</p>
        <div className="hero-actions">
          <CandyButton href="#works">浏览作品 <span aria-hidden="true">↘</span></CandyButton>
          <CandyButton href={site.githubUrl} variant="secondary">查看作者 GitHub 主页 <span aria-hidden="true">↗</span></CandyButton>
        </div>
        <a className="hero-contact" href={`mailto:${site.email}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none"><rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="hero-contact__text"><span>邮箱联系我</span><span className="hero-contact__address">{site.email}</span></span>
        </a>
        <div className="hero-postscript"><svg viewBox="0 0 49 40" width="49" height="40" fill="none" aria-hidden="true"><path d="M3 11q17 36 40 1M33 12l12-7-1 14" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg><span>从一个小小的「如果」开始。</span></div>
      </div>
      <div className="hero-illustration">
        <Image
          src="/illustrations/creator-hero-v2.png"
          alt="蓝灰猫抱着电脑坐在黄色沙发上，身旁蜷着黑猫，粉色背景周围环绕 Prompt、小工具、小游戏、Skill、Agent 和学习笔记六类创作元素。"
          width={1312}
          height={1199}
          unoptimized
          loading="eager"
        />
      </div>
    </section>
  );
}
