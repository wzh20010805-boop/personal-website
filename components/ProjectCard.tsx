import Image from "next/image";
import { categories } from "@/data/categories";
import type { Project } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  const category = categories.find((item) => item.id === project.category);
  return (
    <article className="project-card">
      <div className="project-card__cover">
        {project.cover ? <Image src={project.cover.src} alt={project.cover.alt} width={520} height={320} unoptimized /> : (
          <>
            <svg aria-hidden="true" viewBox="0 0 250 160" fill="none" className="project-card__sketch">
              <g stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
                <path d="m46 35 153-13 10 112-153 12Z" fill="var(--ink)" />
                <path d="m34 26 153-13 10 112-153 12Z" fill="var(--paper-light)" />
                <path d="m47 45 127-11 5 65-126 11Z" fill="var(--learning)" />
                <path d="m53 109 38-42 29 23 21-28 38 37Z" fill="var(--tool)" />
                <circle cx="151" cy="55" r="10" fill="var(--skill)" />
                <path d="m83 17 40-4-3 15-38 4Z" fill="var(--prompt)" strokeWidth="2" />
                <path d="m204 38 5 12 13 4-12 6-3 13-6-12-13-3 12-7Z" fill="var(--skill)" />
                <path d="m18 79 6 1m-2-13 5 4m-12 21 8-2m174 55 6-2" />
              </g>
            </svg>
            <span className="project-card__cover-note">封面占位</span>
          </>
        )}
      </div>
      <div className="project-card__body">
        <div className="project-card__eyebrow"><span className="small-label">{project.isPlaceholder ? "样式预览" : category?.title ?? "作品"}</span><span>{project.status}</span></div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        {category && <p className="project-card__category">分类：{category.title}</p>}
        {project.link?.href && <a className="project-card__link" href={project.link.href}>{project.link.label} <span aria-hidden="true">↗</span></a>}
        {project.isPlaceholder && <p className="project-card__footnote">留一个位置，给下一个好想法。</p>}
      </div>
    </article>
  );
}
