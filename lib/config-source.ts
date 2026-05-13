/**
 * Fetch the repository configuration from GitHub and normalize it to the
 * plain object shape the rest of the app consumes.
 *
 * Discovery priority: `.pages.config.ts` → `.pages.config.js` →
 * `.pages.config.mjs` → `.pages.yml`. First hit wins; YAML stays as the
 * default for backwards compatibility.
 */

import { createOctokitInstance } from "@/lib/utils/octokit";
import { normalizeConfig, parseConfig } from "@/lib/config";
import { evalConfigModule, ConfigEvaluationError } from "@/lib/config-evaluator";
import { ConfigSchema } from "@/lib/config-schema";

type ConfigSource = "ts" | "js" | "mjs" | "yaml";

type LoadedConfig = {
  sha: string;
  object: Record<string, any>;
  source: ConfigSource;
};

type ConfigFileCandidate = {
  path: string;
  source: ConfigSource;
};

const CONFIG_FILE_CANDIDATES: readonly ConfigFileCandidate[] = [
  { path: ".pages.config.ts", source: "ts" },
  { path: ".pages.config.js", source: "js" },
  { path: ".pages.config.mjs", source: "mjs" },
  { path: ".pages.yml", source: "yaml" },
] as const;

type FetchedConfigFile = {
  path: string;
  source: ConfigSource;
  content: string;
  sha: string;
};

const fetchFileIfExists = async (
  octokit: ReturnType<typeof createOctokitInstance>,
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<{ sha: string; content: string } | null> => {
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    if (Array.isArray(response.data)) {
      throw new Error(`Expected ${path} to be a file but found a directory.`);
    }
    if (response.data.type !== "file") {
      throw new Error(`Invalid response type for ${path}.`);
    }

    const content = Buffer.from(response.data.content, "base64").toString();
    return { sha: response.data.sha, content };
  } catch (error: any) {
    if (
      error?.status === 404 &&
      error?.response?.data?.message === "Not Found"
    ) {
      return null;
    }
    throw error;
  }
};

const detectConfigFile = async (
  octokit: ReturnType<typeof createOctokitInstance>,
  owner: string,
  repo: string,
  branch: string,
): Promise<FetchedConfigFile | null> => {
  for (const candidate of CONFIG_FILE_CANDIDATES) {
    const file = await fetchFileIfExists(octokit, owner, repo, branch, candidate.path);
    if (file) {
      return { ...file, path: candidate.path, source: candidate.source };
    }
  }
  return null;
};

const loadConfigObject = async (file: FetchedConfigFile): Promise<Record<string, any>> => {
  if (file.source === "yaml") {
    const parsed = parseConfig(file.content);
    return normalizeConfig(parsed.document.toJSON());
  }

  const exported = await evalConfigModule(file.content, {
    filename: file.path,
    format: file.source,
  });

  // Validate the shape produced by the user's TS/JS module before normalizing.
  // YAML configs are validated implicitly by the settings editor pipeline; for
  // TS we have no source-position info, so we surface Zod issues by path.
  const parsed = ConfigSchema.safeParse(exported);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const path = firstIssue?.path?.join(".") || "(root)";
    throw new ConfigEvaluationError(
      `Invalid configuration in ${file.path} at ${path}: ${firstIssue?.message ?? "unknown error"}`,
    );
  }

  return normalizeConfig(parsed.data);
};

const loadConfigFromGithub = async (
  owner: string,
  repo: string,
  branch: string,
  token: string,
): Promise<LoadedConfig | null> => {
  const octokit = createOctokitInstance(token);
  const file = await detectConfigFile(octokit, owner, repo, branch);
  if (!file) return null;

  const object = await loadConfigObject(file);
  return {
    sha: file.sha,
    object,
    source: file.source,
  };
};

export { loadConfigFromGithub, detectConfigFile };
export type { ConfigSource, LoadedConfig };
