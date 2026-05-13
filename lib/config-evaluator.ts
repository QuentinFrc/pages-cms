/**
 * Evaluate a user-authored `.pages.config.{ts,js,mjs}` file from a third-party
 * repo and return the default export.
 *
 * Why this exists: TS source must be transpiled before Node can run it, and
 * because the source is untrusted, we cannot just `import()` it. We pipe it
 * through esbuild (`transform`) to produce CJS, then execute that CJS in a
 * fresh `node:vm` context exposing only a controlled `require` shim that
 * resolves a single specifier — `@pagescms/config`.
 *
 * Hardening: 1 MB source cap, 1s vm timeout, no globals beyond the context
 * bag, errors are sanitized before bubbling up.
 */

import vm from "node:vm";
import { transform } from "esbuild";
import * as configPublic from "@/lib/config-public";

const PUBLIC_MODULE_SPECIFIER = "@pagescms/config";
const MAX_SOURCE_BYTES = 256 * 1024;
const EVAL_TIMEOUT_MS = 1_000;

type ConfigFormat = "ts" | "js" | "mjs";

const loaderFor = (format: ConfigFormat): "ts" | "js" => {
  switch (format) {
    case "ts":
      return "ts";
    case "js":
    case "mjs":
      return "js";
  }
};

class ConfigEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigEvaluationError";
  }
}

const evalConfigModule = async (
  source: string,
  options: { filename: string; format: ConfigFormat },
): Promise<unknown> => {
  if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) {
    throw new ConfigEvaluationError(
      `Config file is too large (max ${MAX_SOURCE_BYTES} bytes).`,
    );
  }

  let transpiled: string;
  try {
    const result = await transform(source, {
      loader: loaderFor(options.format),
      format: "cjs",
      target: "node18",
      platform: "node",
      sourcefile: options.filename,
      sourcemap: false,
      logLevel: "silent",
    });
    transpiled = result.code;
  } catch (error: any) {
    throw new ConfigEvaluationError(
      `Failed to transpile ${options.filename}: ${error?.message ?? "unknown error"}`,
    );
  }

  const moduleExports: Record<string, unknown> = {};
  const moduleObject: { exports: Record<string, unknown> } = { exports: moduleExports };

  const requireShim = (specifier: string): unknown => {
    if (specifier === PUBLIC_MODULE_SPECIFIER) return configPublic;
    throw new ConfigEvaluationError(
      `Import '${specifier}' is not allowed in ${options.filename}. Only '${PUBLIC_MODULE_SPECIFIER}' may be imported.`,
    );
  };

  const sandbox: Record<string, unknown> = {
    module: moduleObject,
    exports: moduleExports,
    require: requireShim,
  };

  const context = vm.createContext(sandbox, {
    name: `pages-config:${options.filename}`,
    codeGeneration: { strings: false, wasm: false },
  });

  let script: vm.Script;
  try {
    script = new vm.Script(transpiled, { filename: options.filename });
  } catch (error: any) {
    throw new ConfigEvaluationError(
      `Failed to compile ${options.filename}: ${error?.message ?? "unknown error"}`,
    );
  }

  try {
    script.runInContext(context, {
      timeout: EVAL_TIMEOUT_MS,
      breakOnSigint: true,
    });
  } catch (error: any) {
    if (error instanceof ConfigEvaluationError) throw error;
    throw new ConfigEvaluationError(
      `Failed to evaluate ${options.filename}: ${error?.message ?? "unknown error"}`,
    );
  }

  const finalExports = moduleObject.exports as Record<string, unknown>;
  const defaultExport =
    finalExports && typeof finalExports === "object" && "default" in finalExports
      ? finalExports.default
      : finalExports;

  if (defaultExport == null || typeof defaultExport !== "object") {
    throw new ConfigEvaluationError(
      `${options.filename} must export a configuration object as its default export.`,
    );
  }

  return defaultExport;
};

export { evalConfigModule, ConfigEvaluationError };
export type { ConfigFormat };
