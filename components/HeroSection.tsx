import { site } from "@/data/site";
import { CandyButton } from "./CandyButton";
import { CreatorScene } from "./CreatorScene";

export function HeroSection() {
  return (
    <section className="hero page-shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="hero-eyebrow"><span aria-hidden="true">✳</span>{site.identity}</span>
        <h1 id="hero-title">{site.title.firstLine}<br />{site.title.secondLine}<span className="hero-highlight">{site.title.highlight}</span><span className="hero-title-dot" aria-hidden="true">。</span></h1>
        <p className="hero-description">{site.description}</p>
        <div className="hero-actions">
          <CandyButton href="#works">浏览作品 <span aria-hidden="true">↘</span></CandyButton>
          {site.githubUrl ? <CandyButton href={site.githubUrl} variant="secondary">查看 GitHub <span aria-hidden="true">↗</span></CandyButton> : <CandyButton disabled variant="secondary" describedBy="github-note">查看 GitHub <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none"><rect x="4" y="8" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M7 8V5a3 3 0 0 1 6 0v3m-3 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></CandyButton>}
        </div>
        {!site.githubUrl && <p className="github-note" id="github-note">GitHub 链接待补充</p>}
        <div className="hero-postscript"><svg viewBox="0 0 49 40" width="49" height="40" fill="none" aria-hidden="true"><path d="M3 11q17 36 40 1M33 12l12-7-1 14" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg><span>从一个小小的「如果」开始。</span></div>
      </div>
      <CreatorScene />
    </section>
  );
}
