/**
 * Persist and synchronize repository configuration between GitHub and the DB.
 */

import { Config, ConfigSource } from "@/types/config";
import { db } from "@/db";
import { configTable } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { configVersion } from "@/lib/config";
import { loadConfigFromGithub } from "@/lib/config-source";

const asConfigSource = (value: string | null | undefined): ConfigSource | null => {
  if (value === "ts" || value === "js" || value === "mjs" || value === "yaml") return value;
  return null;
};

const getConfigFromDb = async (
  owner: string,
  repo: string,
  branch: string,
): Promise<Config | null> => {
  if (!owner || !repo || !branch) throw new Error(`Owner, repo, and branch must all be provided.`);
  
  const config = await db.query.configTable.findFirst({
    where: and(
      sql`lower(${configTable.owner}) = lower(${owner})`,
      sql`lower(${configTable.repo}) = lower(${repo})`,
      eq(configTable.branch, branch),
    )
  });
  
  if (!config) return null;

  const parsedConfig: Config = {
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    sha: config.sha,
    version: config.version,
    object: JSON.parse(config.object),
    source: asConfigSource(config.source),
    lastCheckedAt: config.lastCheckedAt,
  };

  return parsedConfig;
};

const saveConfig = async (
  config: Config,
): Promise<Config> => {
  await db.insert(configTable).values({
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    sha: config.sha,
    version: config.version,
    object: JSON.stringify(config.object),
    source: config.source ?? null,
    lastCheckedAt: new Date(),
  }).onConflictDoUpdate({
    target: [configTable.owner, configTable.repo, configTable.branch],
    set: {
      sha: config.sha,
      version: config.version,
      object: JSON.stringify(config.object),
      source: config.source ?? null,
      lastCheckedAt: new Date(),
    },
  });

  return config;
}

const updateConfig = async (
  config: Config,
): Promise<Config> => {
  await db.update(configTable).set({
    sha: config.sha,
    version: config.version,
    object: JSON.stringify(config.object),
    source: config.source ?? null,
    lastCheckedAt: new Date(),
  }).where(
    and(
      sql`lower(${configTable.owner}) = lower(${config.owner})`,
      sql`lower(${configTable.repo}) = lower(${config.repo})`,
      eq(configTable.branch, config.branch)
    )
  );

  return config;
}

const touchConfigCheck = async (
  owner: string,
  repo: string,
  branch: string,
) => {
  await db.update(configTable).set({
    lastCheckedAt: new Date(),
  }).where(
    and(
      sql`lower(${configTable.owner}) = lower(${owner})`,
      sql`lower(${configTable.repo}) = lower(${repo})`,
      eq(configTable.branch, branch),
    ),
  );
};

type GetConfigOptions = {
  sync?: boolean;
  getToken?: () => Promise<string>;
  bootstrapOnMiss?: boolean;
  ttlMs?: number;
  backgroundRefreshWhenStale?: boolean;
};

const DEFAULT_CONFIG_CHECK_TTL_MS = parseInt(
  process.env.CONFIG_CHECK_MIN ||
    process.env.CFG_CHECK_MIN ||
    process.env.CONFIG_CHECK_TTL ||
    "5",
  10,
) * 60 * 1000;

const isConfigCheckDue = (lastCheckedAt?: Date, ttlMs = DEFAULT_CONFIG_CHECK_TTL_MS) => {
  if (!lastCheckedAt) return true;
  return Date.now() - new Date(lastCheckedAt).getTime() > ttlMs;
};

const configSyncInFlight = new Map<string, Promise<Config | null>>();
const getConfigSyncKey = (owner: string, repo: string, branch: string) =>
  `${owner.toLowerCase()}::${repo.toLowerCase()}::${branch}`;

const fetchConfigFromGithub = async (
  owner: string,
  repo: string,
  branch: string,
  token: string,
): Promise<Pick<Config, "sha" | "object" | "source"> | null> => {
  return loadConfigFromGithub(owner, repo, branch, token);
};

const getConfig = async (
  owner: string,
  repo: string,
  branch: string,
  options?: GetConfigOptions,
): Promise<Config | null> => {
  const sync = options?.sync ?? false;
  const getToken = options?.getToken;
  const bootstrapOnMiss = options?.bootstrapOnMiss ?? true;
  if (sync && !getToken) throw new Error("getToken is required when sync is enabled.");
  const resolveToken = getToken;
  const requireToken = getToken!;

  const normalizedOwner = owner.toLowerCase();
  const normalizedRepo = repo.toLowerCase();
  const key = getConfigSyncKey(normalizedOwner, normalizedRepo, branch);
  const existing = configSyncInFlight.get(key);
  if (existing) return existing;

  const run = (async (): Promise<Config | null> => {
    const cachedConfig = await getConfigFromDb(normalizedOwner, normalizedRepo, branch);
    if (!sync) {
      if (cachedConfig?.version === configVersion) return cachedConfig;
      if (!resolveToken || !bootstrapOnMiss) return cachedConfig;

      const token = await resolveToken();
      if (!token) throw new Error("Token not found");

      const latest = await fetchConfigFromGithub(owner, repo, branch, token);
      if (!latest) return null;

      const nextConfig: Config = {
        owner: normalizedOwner,
        repo: normalizedRepo,
        branch,
        sha: latest.sha,
        version: configVersion ?? "0.0",
        object: latest.object,
        source: latest.source ?? null,
      };
      await saveConfig(nextConfig);
      return nextConfig;
    }

    const ttlMs = options?.ttlMs ?? DEFAULT_CONFIG_CHECK_TTL_MS;
    const backgroundRefreshWhenStale = options?.backgroundRefreshWhenStale ?? false;

    if (
      cachedConfig &&
      cachedConfig.version === configVersion &&
      !isConfigCheckDue(cachedConfig.lastCheckedAt, ttlMs)
    ) {
      return cachedConfig;
    }

    if (
      cachedConfig &&
      cachedConfig.version === configVersion &&
      backgroundRefreshWhenStale
    ) {
      // Return stale cache immediately and refresh async to reduce branch-layout blocking.
      void (async () => {
        try {
          const token = await requireToken();
          if (!token) return;
          const latest = await fetchConfigFromGithub(owner, repo, branch, token);
          if (!latest) {
            await db.delete(configTable).where(
              and(
                sql`lower(${configTable.owner}) = lower(${normalizedOwner})`,
                sql`lower(${configTable.repo}) = lower(${normalizedRepo})`,
                eq(configTable.branch, branch),
              ),
            );
            return;
          }
          if (cachedConfig.sha === latest.sha && cachedConfig.source === (latest.source ?? null)) {
            await touchConfigCheck(owner, repo, branch);
            return;
          }
          const nextConfig: Config = {
            owner: normalizedOwner,
            repo: normalizedRepo,
            branch,
            sha: latest.sha,
            version: configVersion ?? "0.0",
            object: latest.object,
            source: latest.source ?? null,
          };
          await updateConfig(nextConfig);
        } catch {
          // Ignore background refresh failures; stale cached config remains usable.
        }
      })();

      return cachedConfig;
    }

    const token = await requireToken();
    if (!token) throw new Error("Token not found");

    const latest = await fetchConfigFromGithub(owner, repo, branch, token);
    if (!latest) {
      if (cachedConfig) {
        await db.delete(configTable).where(
          and(
            sql`lower(${configTable.owner}) = lower(${normalizedOwner})`,
            sql`lower(${configTable.repo}) = lower(${normalizedRepo})`,
            eq(configTable.branch, branch),
          ),
        );
      }
      return null;
    }

    if (
      cachedConfig &&
      cachedConfig.version === configVersion &&
      cachedConfig.sha === latest.sha &&
      cachedConfig.source === (latest.source ?? null)
    ) {
      await touchConfigCheck(normalizedOwner, normalizedRepo, branch);
      return {
        ...cachedConfig,
        lastCheckedAt: new Date(),
      };
    }

    const nextConfig: Config = {
      owner: normalizedOwner,
      repo: normalizedRepo,
      branch,
      sha: latest.sha,
      version: configVersion ?? "0.0",
      object: latest.object,
      source: latest.source ?? null,
    };

    if (cachedConfig) {
      await updateConfig(nextConfig);
    } else {
      await saveConfig(nextConfig);
    }

    return nextConfig;
  })();

  configSyncInFlight.set(key, run);
  try {
    return await run;
  } finally {
    configSyncInFlight.delete(key);
  }
};

export { getConfig, saveConfig, updateConfig, touchConfigCheck };
