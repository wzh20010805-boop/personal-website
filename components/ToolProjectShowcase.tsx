import Image from "next/image";
import type { Project } from "@/data/projects";

export function ToolProjectShowcase({ project }: { project: Project }) {
  return (
    <article className="tool-project">
      <div className="tool-project__lead">
        <figure className="tool-project__visual">
          {project.cover ? (
            <>
              <Image
                src={project.cover.src}
                alt={project.cover.alt}
                width={project.cover.width}
                height={project.cover.height}
                unoptimized
                loading="eager"
              />
              <figcaption>像素光标 · 软件界面</figcaption>
            </>
          ) : <figcaption>截图待补充</figcaption>}
        </figure>

        <div className="tool-project__intro">
          <div className="tool-project__eyebrow"><span>{project.status}</span><span>资料版本 {project.sourceVersion}</span></div>
          <h1>{project.title}</h1>
          <p className="tool-project__summary">{project.description}</p>
          <dl className="tool-project__facts">
            <div><dt>运行要求</dt><dd>{project.requirements.join("；")}</dd></div>
            <div><dt>分发方式</dt><dd>{project.delivery}</dd></div>
          </dl>
          <div className="tool-project__actions">
            {project.links.map((link, index) => (
              <a key={link.href} className={`candy-button ${index === 0 ? "candy-button--primary" : "candy-button--secondary"}`} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}<span aria-hidden="true">↗</span><span className="sr-only">（新标签页打开）</span>
              </a>
            ))}
          </div>
          <p className="tool-project__version">本页介绍基于 {project.sourceVersion}；下载版本以 GitHub 发布页为准。</p>
        </div>
      </div>

      {project.motivation && project.motivation.length > 0 && (
        <section className="tool-project__story" aria-labelledby="project-story-title">
          <span className="small-label">一个想法的起点</span>
          <h2 id="project-story-title">为什么做这个应用</h2>
          {project.motivation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      )}

      <div className="tool-project__details">
        <section className="tool-detail-card" id="capabilities" aria-labelledby="capabilities-title">
          <span className="tool-detail-card__number" aria-hidden="true">01</span>
          <h2 id="capabilities-title">能做什么</h2>
          <ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          {project.cover && project.cursorStates && project.cursorStates.length > 0 && (
            <div className="cursor-previews">
              <h3>常见光标状态</h3>
              <p className="cursor-previews__note">{project.cursorPreviewCaption}</p>
              <div className="cursor-previews__grid">
                {project.cursorStates.map((state) => (
                  <figure className="cursor-state" key={state.id}>
                    <div className="cursor-state__image">
                      <svg viewBox={state.viewBox} role="img" aria-label={`${state.title}光标的真实截图预览`}>
                        <image href={project.cover!.src} width={project.cover!.width} height={project.cover!.height} />
                      </svg>
                    </div>
                    <figcaption>
                      <h4>{state.title}</h4>
                      <p>{state.description}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </section>
        <section className="tool-detail-card">
          <span className="tool-detail-card__number" aria-hidden="true">02</span>
          <h2>怎么使用</h2>
          <ol>{project.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
      </div>

      <aside className="tool-project__notice" aria-labelledby="download-note-title">
        <span aria-hidden="true">!</span>
        <div><h2 id="download-note-title">下载前须知</h2><p>{project.notice}</p></div>
      </aside>
    </article>
  );
}
