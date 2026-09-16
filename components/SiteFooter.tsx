import { site } from "@/data/site";
import { StudioMark } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="site-footer page-shell">
      <div className="footer-signature"><StudioMark /><span><strong>{site.name}</strong><span>用好奇心打底，把想法做出来。</span></span></div>
      <p>第一阶段 · 静态视觉预览</p>
      <a href="#top">回到顶部 <span aria-hidden="true">↑</span></a>
    </footer>
  );
}
