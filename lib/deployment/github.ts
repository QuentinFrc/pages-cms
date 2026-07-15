import { createOctokitInstance } from "@/lib/utils/octokit";
import type {
  DeploymentInfo,
  DeploymentProvider,
  DeploymentProviderContext,
  DeploymentStatus,
} from "@/lib/deployment/types";

const mapDeploymentState = (state: string | null | undefined): DeploymentStatus => {
  switch ((state || "").toLowerCase()) {
    case "success":
      return "ready";
    case "failure":
    case "error":
      return "error";
    case "inactive":
      return "inactive";
    case "queued":
    case "pending":
    case "in_progress":
      return "building";
    default:
      return "queued";
  }
};

const mapCheckOrStatusState = (state: string | null | undefined): DeploymentStatus => {
  switch ((state || "").toLowerCase()) {
    case "success":
    case "completed":
      return "ready";
    case "failure":
    case "cancelled":
    case "timed_out":
    case "action_required":
    case "error":
      return "error";
    case "in_progress":
    case "queued":
    case "pending":
    case "waiting":
      return "building";
    default:
      return "queued";
  }
};

const getGithubDeployments = async (
  octokit: ReturnType<typeof createOctokitInstance>,
  { owner, repo, branch, sha }: DeploymentProviderContext,
): Promise<DeploymentInfo[]> => {
  const listParams: any = { owner, repo, per_page: 20 };
  if (sha) listParams.sha = sha;
  else listParams.ref = branch;

  let deployments;
  try {
    const response = await octokit.rest.repos.listDeployments(listParams);
    deployments = response.data;
  } catch {
    return [];
  }

  const infos = await Promise.all(
    deployments.map(async (deployment: any): Promise<DeploymentInfo | null> => {
      let statuses: any[] = [];
      try {
        const statusResponse = await octokit.rest.repos.listDeploymentStatuses({
          owner,
          repo,
          deployment_id: deployment.id,
          per_page: 1,
        });
        statuses = statusResponse.data;
      } catch {
        return null;
      }

      const latest = statuses[0];
      const status = mapDeploymentState(latest?.state ?? "queued");

      const isProduction =
        typeof deployment.production_environment === "boolean"
          ? deployment.production_environment
          : !deployment.transient_environment;

      const environment =
        deployment.environment ||
        (isProduction ? "Production" : "Preview");

      return {
        id: `github:${deployment.id}`,
        status,
        environment,
        url: latest?.environment_url || latest?.target_url || undefined,
        logsUrl: latest?.log_url || latest?.target_url || undefined,
        sha: deployment.sha,
        ref: deployment.ref,
        createdAt: deployment.created_at,
        updatedAt: latest?.created_at || deployment.updated_at || deployment.created_at,
        provider: "github",
        isProduction,
      };
    }),
  );

  return infos.filter((info): info is DeploymentInfo => info !== null);
};

const getCheckRunFallback = async (
  octokit: ReturnType<typeof createOctokitInstance>,
  { owner, repo, branch, sha }: DeploymentProviderContext,
): Promise<DeploymentInfo[]> => {
  let ref = sha;
  if (!ref) {
    try {
      const branchResponse = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch,
      });
      ref = branchResponse.data.commit.sha;
    } catch {
      return [];
    }
  }

  const items: DeploymentInfo[] = [];

  try {
    const statusResponse = await octokit.rest.repos.getCombinedStatusForRef({
      owner,
      repo,
      ref: ref!,
    });

    statusResponse.data.statuses.forEach((entry: any) => {
      items.push({
        id: `status:${entry.id}`,
        status: mapCheckOrStatusState(entry.state),
        environment: entry.context || "Deployment",
        url: entry.target_url || undefined,
        logsUrl: entry.target_url || undefined,
        sha: statusResponse.data.sha,
        ref: branch,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at || entry.created_at,
        provider: "github",
      });
    });
  } catch {}

  try {
    const checksResponse = await octokit.rest.checks.listForRef({
      owner,
      repo,
      ref: ref!,
      per_page: 20,
    });

    checksResponse.data.check_runs.forEach((run: any) => {
      items.push({
        id: `check:${run.id}`,
        status: mapCheckOrStatusState(run.conclusion || run.status),
        environment: run.name || "Check",
        url: run.details_url || run.html_url || undefined,
        logsUrl: run.details_url || run.html_url || undefined,
        sha: ref!,
        ref: branch,
        createdAt: run.started_at || new Date().toISOString(),
        updatedAt: run.completed_at || run.started_at || new Date().toISOString(),
        provider: "github",
      });
    });
  } catch {}

  return items;
};

export const githubDeploymentProvider: DeploymentProvider = {
  name: "github",
  async getDeployments(opts) {
    const octokit = createOctokitInstance(opts.token);
    const deployments = await getGithubDeployments(octokit, opts);
    if (deployments.length > 0) return deployments;
    return getCheckRunFallback(octokit, opts);
  },
};
