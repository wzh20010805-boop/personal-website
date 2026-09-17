import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryArt } from "@/components/CategoryArt";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { Category } from "@/data/categories";

export function makeCategoryMetadata(category: Category): Metadata {
  return {
    title: `${category.title} | 创作空间`,
    description: category.description.replace("\n", " "),
  };
}

export function CategoryPageShell({
  category,
  count,
  children,
}: {
  category: Category;
  count: number;
  children: ReactNode;
}) {
  return (
    <div id="top" style={{ "--category-color": category.color } as CSSProperties}>
      <a className="skip-link" href="#content">跳到内容</a>
      <SiteHeader />
      <main id="content" className="category-page page-shell" data-published-count={count}>
        <nav className="breadcrumb" aria-label="面包屑">
          <Link prefetch={false} href="/">首页</Link><span aria-hidden="true">/</span><span aria-current="page">{category.title}</span>
        </nav>

        <header className="category-hero">
          <div className="category-hero__art" aria-hidden="true">
            <div className="category-hero__dots" />
            <CategoryArt kind={category.id} className="category-hero__object" />
            <span>✳</span>
          </div>
          <div className="category-hero__copy">
            <span className="section-kicker">{category.english} / CREATIVE DRAWER</span>
            <h1>{category.title}</h1>
            <p>{category.description}</p>
            {count > 0 && <span className="category-hero__count">{count} {category.unit}</span>}
          </div>
        </header>

        <div className="category-content">{children}</div>
        <Link prefetch={false} className="back-to-works" href="/#works"><span aria-hidden="true">←</span> 返回首页作品区</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
