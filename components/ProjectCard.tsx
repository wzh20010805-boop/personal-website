import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import styles from "./ProjectCard.module.css";

export function ProjectCard({ project }: { project: Project }) {
  const isSkill = project.category === "skills";

  return (
    <Link
      href={project.detailHref}
      prefetch={false}
      className={isSkill ? `project-card ${styles.skillCard}` : "project-card"}
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
        {project.coverCaption && <span className={styles.coverCaption}>{project.coverCaption}</span>}
      </div>
      <div className="project-card__body">
        <div className="project-card__eyebrow">
          <span className="small-label">{project.status}</span>
          {project.typeLabel ? <span>{project.typeLabel}</span> : <span>资料版本 {project.sourceVersion}</span>}
        </div>
        <h2 id={`project-${project.id}-title`}>{project.title}</h2>
        {project.subtitle && <p className={styles.subtitle}>{project.subtitle}</p>}
        <p id={`project-${project.id}-description`}>{project.description}</p>
        <span className="project-card__link">{project.detailLabel ?? "查看工具介绍"} <span aria-hidden="true">→</span></span>
        {project.visibility === "private" && (
          <p className={styles.privateNote}><span aria-hidden="true">🔒</span> {project.notice}</p>
        )}
      </div>
    </Link>
  );
}
