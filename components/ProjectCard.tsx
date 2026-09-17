import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={project.detailHref}
      prefetch={false}
      className="project-card"
      aria-labelledby={`project-${project.id}-title`}
      aria-describedby={`project-${project.id}-description`}
    >
      <div className="project-card__cover">
        {project.cover ? (
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            unoptimized
          />
        ) : <span className="project-card__cover-note">截图待补充</span>}
      </div>
      <div className="project-card__body">
        <div className="project-card__eyebrow">
          <span className="small-label">{project.status}</span>
          <span>资料版本 {project.sourceVersion}</span>
        </div>
        <h2 id={`project-${project.id}-title`}>{project.title}</h2>
        <p id={`project-${project.id}-description`}>{project.description}</p>
        <span className="project-card__link">查看工具介绍 <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
