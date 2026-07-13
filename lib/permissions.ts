import type { User } from "@/types/user";

export type PermCtx = {
  user: Partial<Pick<User, "id" | "email" | "isAdmin" | "githubUsername">> | null | undefined;
  singleProject?: boolean;
  githubRepoPermissions?: { push?: boolean; admin?: boolean };
};

export type PermissionCheck = (ctx: PermCtx) => boolean;

const hasGithub = (c: PermCtx) => Boolean(c.user?.githubUsername);

export const can = {
  admin: {
    access: (c: PermCtx) => Boolean(c.user?.isAdmin),
  },
  github: {
    act: hasGithub,
  },
  projects: {
    list: (c: PermCtx) => !c.singleProject,
    switch: (c: PermCtx) => !c.singleProject,
    createFromTemplate: hasGithub,
  },
  repo: {
    manage: hasGithub,
    write: (c: PermCtx) => Boolean(c.githubRepoPermissions?.push),
    cache: { view: hasGithub },
    collaborators: { view: hasGithub },
    configuration: { view: hasGithub },
    actions: {
      view: hasGithub,
      rerun: hasGithub,
    },
  },
} as const;
