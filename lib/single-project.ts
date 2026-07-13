import { redirect } from "next/navigation";

export type ProjectContext = {
  owner: string;
  repo: string;
  branch?: string;
};

const ENV_KEY = "SINGLE_PROJECT_REPO";

let parsed: ProjectContext | null | undefined;

function parseFromEnv(): ProjectContext | null {
  const raw = process.env[ENV_KEY];
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  const segments = trimmed.split("/").map((s) => s.trim());
  if (segments.length < 2 || segments.length > 3 || segments.some((s) => s === "")) {
    throw new Error(
      `Invalid ${ENV_KEY}: expected "owner/repo" or "owner/repo/branch", got "${raw}"`,
    );
  }

  const [owner, repo, branch] = segments;
  return branch
    ? { owner: owner.toLowerCase(), repo: repo.toLowerCase(), branch }
    : { owner: owner.toLowerCase(), repo: repo.toLowerCase() };
}

function load(): ProjectContext | null {
  if (parsed === undefined) parsed = parseFromEnv();
  return parsed;
}

export function getProjectContext(): ProjectContext | null {
  return load();
}

export function isSingleProjectMode(): boolean {
  return load() !== null;
}

export function getHomeHref(): string {
  const project = load();
  if (!project) return "/";
  const base = `/${project.owner}/${project.repo}`;
  return project.branch ? `${base}/${encodeURIComponent(project.branch)}` : base;
}

export function matchesProjectContext(owner: string, repo: string): boolean {
  const project = load();
  if (!project) return true;
  return (
    project.owner === owner.toLowerCase() && project.repo === repo.toLowerCase()
  );
}

export function assertProjectAllowed(owner: string, repo: string): void {
  if (!matchesProjectContext(owner, repo)) {
    redirect(getHomeHref());
  }
}
