import { CategoryPageShell, makeCategoryMetadata } from "@/components/CategoryPageShell";
import { EmptyCategoryState } from "@/components/EmptyCategoryState";
import { getCategory } from "@/data/categories";
import { getPublishedProjectsByCategory } from "@/data/projects";

const category = getCategory("learning");
const projects = getPublishedProjectsByCategory(category.id);
export const metadata = makeCategoryMetadata(category);

export default function LearningPage() {
  return <CategoryPageShell category={category} count={projects.length}><EmptyCategoryState /></CategoryPageShell>;
}
