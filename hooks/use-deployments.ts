"use client";

import useSWR from "swr";
import { requireApiSuccess } from "@/lib/api-client";
import type { DeploymentInfo } from "@/lib/deployment/types";

const fetcher = async (url: string): Promise<DeploymentInfo[]> => {
  const response = await fetch(url);
  const payload = await requireApiSuccess<{ data: DeploymentInfo[] }>(
    response,
    "Failed to fetch deployments",
  );
  return payload.data ?? [];
};

type UseDeploymentsInput = {
  owner?: string | null;
  repo?: string | null;
  branch?: string | null;
  enabled?: boolean;
};

export const buildDeploymentsKey = (
  owner: string,
  repo: string,
  branch: string,
) => `/api/${owner}/${repo}/${encodeURIComponent(branch)}/deployments`;

export function useDeployments({
  owner,
  repo,
  branch,
  enabled = true,
}: UseDeploymentsInput) {
  const key =
    enabled && owner && repo && branch
      ? buildDeploymentsKey(owner, repo, branch)
      : null;

  const { data, error, isLoading, mutate } = useSWR<DeploymentInfo[]>(
    key,
    fetcher,
    {
      refreshInterval: (latest) => {
        if (!latest) return 0;
        return latest.some(
          (deployment) =>
            deployment.status === "building" || deployment.status === "queued",
        )
          ? 5000
          : 60000;
      },
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    },
  );

  return {
    deployments: data,
    error,
    isLoading,
    mutate,
    key,
  };
}
