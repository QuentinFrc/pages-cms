import "server-only";

import { createHttpError } from "@/lib/api-error";
import { can, type Permission, type PermCtx } from "@/lib/permissions";

export function assertCan(perm: Permission, ctx: PermCtx, message?: string) {
  if (!can(perm, ctx)) {
    throw createHttpError(message ?? `Missing permission: ${perm}`, 403);
  }
}
