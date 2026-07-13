import { redirect } from "next/navigation";
import { getHomeHref, isSingleProjectMode } from "@/lib/single-project";
import { ProjectsHome } from "./projects-home";

export default function Page() {
  if (isSingleProjectMode()) {
    redirect(getHomeHref());
  }
  return <ProjectsHome />;
}
