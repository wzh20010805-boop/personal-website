import { CategoryPageShell, makeCategoryMetadata } from "@/components/CategoryPageShell";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyCategoryState } from "@/components/EmptyCategoryState";
import { getCategory } from "@/data/categories";
import { getPublishedProjectsByCategory } from "@/data/projects";

const category = getCategory("agents");
const projects = getPublishedProjectsByCategory(category.id);
export const metadata = makeCategoryMetadata(category);

export default function AgentsPage() {
  return <CategoryPageShell category={category} count={projects.length}>{projects.length > 0 ? <div className="project-grid">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <EmptyCategoryState />}</CategoryPageShell>;
}
