import { asc } from "drizzle-orm";
import { db } from "@/db";
import { configTable } from "@/db/schema";

export type SingleProject = {
  owner: string;
  repo: string;
  branch: string;
};

const ENV_KEY = "SINGLE_PROJECT";

export function isSingleProjectMode(): boolean {
  const raw = process.env[ENV_KEY];
  if (raw == null) return false;
  return raw.trim().toLowerCase() === "true";
}

// Looks up the single configured project for this deployment.
// Returns the earliest configTable row, or null when nothing is wired yet.
// Multiple rows are tolerated (UI-only cardinality per PLAN.md); we pick a
// deterministic one instead of erroring, so a mis-provisioned deploy still boots.
export async function getSingleProject(): Promise<SingleProject | null> {
  if (!isSingleProjectMode()) return null;
  const [row] = await db
    .select({
      owner: configTable.owner,
      repo: configTable.repo,
      branch: configTable.branch,
    })
    .from(configTable)
    .orderBy(asc(configTable.id))
    .limit(1);
  return row ?? null;
}

export function singleProjectHref(project: SingleProject): string {
  return `/${project.owner}/${project.repo}/${encodeURIComponent(project.branch)}`;
}
