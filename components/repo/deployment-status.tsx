"use client";

import { useMemo } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Loader, ArrowUpRight } from "lucide-react";
import { useRepo } from "@/contexts/repo-context";
import { useConfig } from "@/contexts/config-context";
import { useDeployments } from "@/hooks/use-deployments";
import { cn } from "@/lib/utils";
import type { DeploymentInfo } from "@/lib/deployment/types";

const pickCurrentDeployment = (deployments: DeploymentInfo[]): DeploymentInfo | null => {
  if (deployments.length === 0) return null;
  const active = deployments.find(
    (deployment) =>
      deployment.status === "building" || deployment.status === "queued",
  );
  if (active) return active;
  const production = deployments.find(
    (deployment) => deployment.isProduction && deployment.status === "ready",
  );
  if (production) return production;
  return deployments[0] ?? null;
};

export function DeploymentStatusBadge() {
  const { owner, repo } = useRepo();
  const { config } = useConfig();
  const branch = config?.branch;

  const { deployments } = useDeployments({
    owner,
    repo,
    branch,
    enabled: Boolean(owner && repo && branch),
  });

  const deployment = useMemo(
    () => (deployments ? pickCurrentDeployment(deployments) : null),
    [deployments],
  );

  if (!deployment) return null;

  if (deployment.status === "building" || deployment.status === "queued") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground"
        title={`${deployment.environment} · ${deployment.status}`}
      >
        <Loader className="size-3 animate-spin" />
        <span>Updating…</span>
      </span>
    );
  }

  if (deployment.status === "error") {
    const errorContent = (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
          "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400",
        )}
        title={`${deployment.environment} · failed`}
      >
        <span className="inline-block size-2 rounded-full bg-red-500" />
        <span>Failed</span>
      </span>
    );
    return deployment.logsUrl ? (
      <a href={deployment.logsUrl} target="_blank" rel="noreferrer">
        {errorContent}
      </a>
    ) : (
      errorContent
    );
  }

  if (deployment.status === "ready") {
    const relative = deployment.updatedAt
      ? formatDistanceToNowStrict(new Date(deployment.updatedAt), { addSuffix: true })
      : "";
    const readyContent = (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
        )}
        title={`${deployment.environment}${relative ? ` · ${relative}` : ""}`}
      >
        <span className="inline-block size-2 rounded-full bg-emerald-500" />
        <span>Live</span>
        {relative && (
          <span className="hidden text-muted-foreground sm:inline">· {relative}</span>
        )}
        {deployment.url && <ArrowUpRight className="size-3 opacity-60" />}
      </span>
    );
    return deployment.url ? (
      <a href={deployment.url} target="_blank" rel="noreferrer">
        {readyContent}
      </a>
    ) : (
      readyContent
    );
  }

  return null;
}
