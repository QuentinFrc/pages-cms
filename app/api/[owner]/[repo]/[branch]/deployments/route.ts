import { getToken } from "@/lib/token";
import { toErrorResponse } from "@/lib/api-error";
import { requireApiUserSession } from "@/lib/session-server";
import { getConfig } from "@/lib/config-store";
import { getDeploymentProvider, DEFAULT_DEPLOYMENT_PROVIDER } from "@/lib/deployment";
import type { DeploymentInfo } from "@/lib/deployment";

type ManualEnvironment = {
  branch: string;
  name?: string;
  url?: string;
};

const mergeManualEnvironments = (
  deployments: DeploymentInfo[],
  manualEnvironments: ManualEnvironment[],
  branch: string,
): DeploymentInfo[] => {
  const manualForBranch = manualEnvironments.filter((env) => env.branch === branch);
  if (manualForBranch.length === 0) return deployments;

  const merged = deployments.map((deployment) => {
    const override = manualForBranch.find((env) => {
      if (env.name && deployment.environment) {
        return env.name.toLowerCase() === deployment.environment.toLowerCase();
      }
      return false;
    });
    if (!override) return deployment;
    return {
      ...deployment,
      environment: override.name || deployment.environment,
      url: override.url || deployment.url,
    };
  });

  manualForBranch.forEach((env) => {
    const alreadyPresent = merged.some((deployment) =>
      env.name
        ? deployment.environment.toLowerCase() === env.name.toLowerCase()
        : false,
    );
    if (alreadyPresent) return;
    merged.push({
      id: `manual:${env.branch}:${env.name || env.url || "default"}`,
      status: env.url ? "ready" : "inactive",
      environment: env.name || "Environment",
      url: env.url,
      sha: "",
      ref: env.branch,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
      provider: "manual",
    });
  });

  return merged;
};

const dedupeByEnvironment = (deployments: DeploymentInfo[]): DeploymentInfo[] => {
  const seen = new Map<string, DeploymentInfo>();
  const sorted = [...deployments].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
  sorted.forEach((deployment) => {
    const key = (deployment.environment || "default").toLowerCase();
    if (!seen.has(key)) seen.set(key, deployment);
  });
  return Array.from(seen.values());
};

export async function GET(
  request: Request,
  context: { params: Promise<{ owner: string; repo: string; branch: string }> },
) {
  try {
    const params = await context.params;
    const sessionResult = await requireApiUserSession();
    if ("response" in sessionResult) return sessionResult.response;
    const user = sessionResult.user;

    const { token } = await getToken(user, params.owner, params.repo, true);

    const url = new URL(request.url);
    const sha = url.searchParams.get("sha") || undefined;

    const config = await getConfig(params.owner, params.repo, params.branch, {
      getToken: async () => token,
    });

    const deploymentConfig = (config?.object as any)?.deployment ?? {};
    const providerName =
      typeof deploymentConfig.provider === "string" && deploymentConfig.provider.trim()
        ? deploymentConfig.provider.trim()
        : DEFAULT_DEPLOYMENT_PROVIDER;
    const manualEnvironments: ManualEnvironment[] = Array.isArray(deploymentConfig.environments)
      ? deploymentConfig.environments
      : [];

    const provider = getDeploymentProvider(providerName);

    let deployments: DeploymentInfo[] = [];
    try {
      deployments = await provider.getDeployments({
        owner: params.owner,
        repo: params.repo,
        branch: params.branch,
        sha,
        token,
      });
    } catch (error) {
      console.error("Failed to fetch deployments:", error);
    }

    const merged = mergeManualEnvironments(deployments, manualEnvironments, params.branch);
    const deduped = dedupeByEnvironment(merged);
    deduped.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

    return Response.json({
      status: "success",
      message: "Deployments fetched successfully.",
      data: deduped,
    });
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
}
