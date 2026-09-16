import type { CategoryId } from "./categories";

export interface Project {
  id: string;
  title: string;
  category: CategoryId | null;
  description: string;
  status: string;
  cover: { src: string; alt: string } | null;
  link: { href: string; label: string } | null;
  isPlaceholder: boolean;
}

export const projects: Project[] = [{
  id: "style-example",
  title: "作品卡片样式示例",
  category: null,
  description: "这里将展示作品简介、封面与已确认的项目链接。",
  status: "占位展示 · 非真实项目",
  cover: null,
  link: null,
  isPlaceholder: true,
}];
