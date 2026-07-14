export type DeploymentStatus =
  | "queued"
  | "building"
  | "ready"
  | "error"
  | "inactive";

export interface DeploymentInfo {
  id: string;
  status: DeploymentStatus;
  environment: string;
  url?: string;
  logsUrl?: string;
  sha: string;
  ref: string;
  createdAt: string;
  updatedAt: string;
  provider: string;
  isProduction?: boolean;
}

export interface DeploymentProviderContext {
  owner: string;
  repo: string;
  branch: string;
  sha?: string;
  token: string;
}

export interface DeploymentProvider {
  name: string;
  getDeployments: (opts: DeploymentProviderContext) => Promise<DeploymentInfo[]>;
}
