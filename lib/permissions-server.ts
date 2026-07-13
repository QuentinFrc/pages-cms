import "server-only";

import { createHttpError } from "@/lib/api-error";
import type { PermCtx, PermissionCheck } from "@/lib/permissions";

export function assertCan(check: PermissionCheck, ctx: PermCtx, message?: string) {
  if (!check(ctx)) {
    throw createHttpError(message ?? "Forbidden.", 403);
  }
}
