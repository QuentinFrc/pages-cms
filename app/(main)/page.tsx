import { redirect } from "next/navigation";
import { getSingleProject, isSingleProjectMode, singleProjectHref } from "@/lib/single-project";
import { ProjectsHome } from "./projects-home";

export default async function Page() {
  if (isSingleProjectMode()) {
    const project = await getSingleProject();
    if (project) redirect(singleProjectHref(project));
  }
  return <ProjectsHome />;
}
