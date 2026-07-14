import { githubDeploymentProvider } from "@/lib/deployment/github";
import type { DeploymentProvider } from "@/lib/deployment/types";

const providers = new Map<string, DeploymentProvider>([
  [githubDeploymentProvider.name, githubDeploymentProvider],
]);

export const DEFAULT_DEPLOYMENT_PROVIDER = "github";

export const getDeploymentProvider = (name?: string): DeploymentProvider => {
  const key = (name || DEFAULT_DEPLOYMENT_PROVIDER).toLowerCase();
  return providers.get(key) ?? githubDeploymentProvider;
};

export type { DeploymentInfo, DeploymentProvider, DeploymentStatus } from "@/lib/deployment/types";
