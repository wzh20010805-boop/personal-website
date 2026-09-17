import Link from "next/link";
import { site } from "@/data/site";

export function StudioMark({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 56 56" fill="none" aria-hidden="true"><path d="m28 4 7 9 11-2-1 12 8 6-10 7 1 12-12-3-9 8-5-11-12-2 5-11-5-10 12-3Z" fill="var(--skill)" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" /><path d="M23 23v5m11-5v5m-12 6q6 6 13-1" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" /></svg>;
}

export function SiteHeader() {
  return (
    <header className="site-header page-shell">
      <Link prefetch={false} href="/" className="site-brand"><StudioMark className="site-brand__mark" /><span>{site.name}<small>一个装满想法的地方</small></span></Link>
      <nav aria-label="主导航"><Link prefetch={false} href="/#works">作品<span aria-hidden="true">↗</span></Link><Link prefetch={false} href="/learning/">学习积累<span aria-hidden="true">↗</span></Link></nav>
      <span className="header-note"><span aria-hidden="true" />保持好奇，自由创造</span>
    </header>
  );
}
