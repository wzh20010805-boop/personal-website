import type { CSSProperties } from "react";
import Link from "next/link";
import type { Category } from "@/data/categories";
import { getPublishedProjectsByCategory } from "@/data/projects";
import { CategoryArt } from "./CategoryArt";

export function CategoryCard({ category, index }: { category: Category; index: number }) {
  const count = getPublishedProjectsByCategory(category.id).length;
  const status = count > 0 ? `${count} ${category.unit} · 进入看看 →` : "正在整理 · 进入看看 →";

  return (
    <Link prefetch={false} id={category.id === "learning" ? "learning" : undefined} href={category.href} className="category-card" style={{ "--category-color": category.color } as CSSProperties} aria-labelledby={`category-${category.id}-title`}>
      <div className="category-card__art">
        <span className="category-card__number" aria-hidden="true">0{index + 1}</span>
        <span className="category-card__english">{category.english}</span>
        <div className="category-card__dots" aria-hidden="true" />
        <CategoryArt kind={category.id} className="category-card__object" />
        <span className="category-card__spark" aria-hidden="true">✳</span>
        <span className="category-card__note">{category.note}</span>
      </div>
      <div className="category-card__body">
        <h3 id={`category-${category.id}-title`}>{category.title}</h3>
        <p>{category.description}</p>
        <span className="category-card__status"><span aria-hidden="true" />{status}</span>
      </div>
    </Link>
  );
}
