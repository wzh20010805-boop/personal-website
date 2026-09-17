import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ToolProjectShowcase } from "@/components/ToolProjectShowcase";
import { getCategory } from "@/data/categories";
import { getPublishedProjectsByCategory } from "@/data/projects";

const category = getCategory("tools");
const project = getPublishedProjectsByCategory(category.id).find((item) => item.id === "pixel-cursor");

export const metadata: Metadata = {
  title: project ? `${project.title} | 创作空间` : "作品未找到 | 创作空间",
  description: project?.description,
};

export default function PixelCursorPage() {
  if (!project) notFound();

  return (
    <div id="top" className="tool-detail">
      <a className="skip-link" href="#content">跳到内容</a>
      <SiteHeader />
      <main id="content" className="tool-detail-page category-page page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <Link prefetch={false} href="/">首页</Link>
          <span aria-hidden="true">/</span>
          <Link prefetch={false} href={category.href}>{category.title}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">像素光标</span>
        </nav>
        <ToolProjectShowcase project={project} />
        <Link prefetch={false} className="back-to-works" href={category.href}>
          <span aria-hidden="true">←</span> 返回小工具列表
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
