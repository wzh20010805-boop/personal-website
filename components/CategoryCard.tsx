import type { CSSProperties } from "react";
import type { Category } from "@/data/categories";
import { CategoryArt } from "./CategoryArt";

export function CategoryCard({ category, index }: { category: Category; index: number }) {
  return (
    <article id={category.id === "learning" ? "learning" : undefined} className="category-card" style={{ "--category-color": category.color } as CSSProperties}>
      <div className="category-card__art">
        <span className="category-card__number" aria-hidden="true">0{index + 1}</span>
        <span className="category-card__english">{category.english}</span>
        <div className="category-card__dots" aria-hidden="true" />
        <CategoryArt kind={category.id} className="category-card__object" />
        <span className="category-card__spark" aria-hidden="true">✳</span>
        <span className="category-card__note">{category.note}</span>
      </div>
      <div className="category-card__body">
        <h3>{category.title}</h3>
        <p>{category.description}</p>
        <span className="category-card__status"><span aria-hidden="true" />内容待补充</span>
      </div>
    </article>
  );
}
