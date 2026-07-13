import type { User } from "@/types/user";

export type PermCtx = {
  user: Partial<Pick<User, "id" | "email" | "isAdmin" | "githubUsername">> | null | undefined;
  singleProject?: boolean;
  githubRepoPermissions?: { push?: boolean; admin?: boolean };
};

const RULES = {
  "admin.access": (c: PermCtx) => Boolean(c.user?.isAdmin),

  "github.act": (c: PermCtx) => Boolean(c.user?.githubUsername),

  "projects.list": (c: PermCtx) => !c.singleProject,
  "projects.switch": (c: PermCtx) => !c.singleProject,
  "projects.createFromTemplate": (c: PermCtx) => Boolean(c.user?.githubUsername),

  "repo.manage": (c: PermCtx) => Boolean(c.user?.githubUsername),
  "repo.cache.view": (c: PermCtx) => Boolean(c.user?.githubUsername),
  "repo.collaborators.view": (c: PermCtx) => Boolean(c.user?.githubUsername),
  "repo.actions.view": (c: PermCtx) => Boolean(c.user?.githubUsername),
  "repo.configuration.view": (c: PermCtx) => Boolean(c.user?.githubUsername),
  "repo.actions.rerun": (c: PermCtx) => Boolean(c.user?.githubUsername),

  "repo.write": (c: PermCtx) => Boolean(c.githubRepoPermissions?.push),
} as const;

export type Permission = keyof typeof RULES;

export function can(perm: Permission, ctx: PermCtx): boolean {
  return RULES[perm](ctx);
}
