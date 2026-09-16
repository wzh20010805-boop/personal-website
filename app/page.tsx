import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { CategoryCard } from "@/components/CategoryCard";
import { ProjectCard } from "@/components/ProjectCard";
import { SiteFooter } from "@/components/SiteFooter";
import { categories } from "@/data/categories";
import { projects } from "@/data/projects";

export default function Home() {
  return (
    <div id="top">
      <a className="skip-link" href="#works">跳到作品预览</a>
      <SiteHeader />
      <main>
        <HeroSection />
        <section id="works" className="works page-shell" aria-labelledby="works-title">
          <div className="section-divider" aria-hidden="true"><span>✳</span><span>把灵感，做成看得见的东西</span><span>✳</span></div>
          <div className="works-heading">
            <div><span className="section-kicker">作品预览 / THE CREATIVE DRAWER</span><h2 id="works-title">打开我的<span>创作抽屉<svg viewBox="0 0 210 15" preserveAspectRatio="none" aria-hidden="true"><path d="M3 9Q99 0 204 6M27 13Q120 5 201 11" fill="none" stroke="var(--prompt)" strokeWidth="5" strokeLinecap="round" /></svg></span></h2></div>
            <p>六个方向，慢慢把想法填满。<br /><span>这里先展示分类样式，内容待补充。</span></p>
          </div>
          <div className="category-grid">{categories.map((category, index) => <CategoryCard key={category.id} category={category} index={index} />)}</div>
          <div className="project-preview">
            <div className="project-preview__heading"><span className="small-label">一张作品卡，会长什么样？</span><span aria-hidden="true">↙</span></div>
            {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
