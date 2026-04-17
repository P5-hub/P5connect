import ProjectClient from "./ProjectClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ProjectPage() {
  return <ProjectClient />;
}