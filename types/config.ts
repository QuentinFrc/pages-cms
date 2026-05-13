export type ConfigSource = "ts" | "js" | "mjs" | "yaml";

export type Config = {
  owner: string;
  repo: string;
  branch: string;
  sha: string;
  version: string;
  object: Record<string, any>;
  source?: ConfigSource | null;
  lastCheckedAt?: Date;
};
