import { partition } from "@std/collections/partition";
import type { Package } from "./types.ts";
import { File } from "./file.ts";

const deduplicate = (a: Package[]): Package[] => {
  return a.filter((o, index, arr) =>
    arr.findIndex((item) => JSON.stringify(item) === JSON.stringify(o)) ===
      index
  );
};

const extractKeys = (obj?: { [key: string]: unknown }): string[] => {
  return obj ? Object.keys(obj) : [];
};

const formatKeys = (keys: string[]): string => {
  return keys.map((key) => ` > ${key}`).join("\n");
};

const inferNameAndVersion = (key: string): Package => {
  const splitPos = key.lastIndexOf("@");

  // Missing version
  if (splitPos === -1) {
    return {
      name: key,
      version: undefined,
    };
  }

  return {
    name: key.slice(0, splitPos),
    version: key.slice(splitPos + 1).split("/")[0],
  };
};

const normalizeJsrKeys = (keys: string[]): Package[] => {
  return deduplicate(keys.map(inferNameAndVersion));
};

const normalizeNpmKeys = normalizeJsrKeys;

const normalizeEsmKeys = (keys: string[]): Package[] => {
  return deduplicate(keys.map((key) => {
    const { pathname } = new URL(key);
    const { name, version } = inferNameAndVersion(pathname);

    // ESM keys may contain url artifacts like `/stable/`, `/v135/`
    const sanitizedName = name.replace(/\/v([0-9]+)|\/stable/g, "");

    return {
      name: sanitizedName.slice(1),
      version,
    };
  }));
};

/** @internal */
export const extractPackages = (
  lockFile: string,
  { ignore, verbose, silent }: {
    ignore?: string[] | readonly [];
    verbose?: boolean;
    silent?: boolean;
  },
): {
  jsr: Package[];
  npm: Package[];
  esm: Package[];
} => {
  const lock: {
    jsr: Record<string, unknown>;
    npm: Record<string, unknown>;
    remote: Record<string, unknown>;
  } = JSON.parse(Deno.readTextFileSync(lockFile));

  const jsrKeys = extractKeys(lock.jsr);
  const npmKeys = extractKeys(lock.npm);
  const esmKeys = extractKeys(lock.remote);

  if (!silent) {
    console.info(`Found ${jsrKeys.length} JSR packages`);
    if (verbose) console.info(formatKeys(jsrKeys));

    console.info(`Found ${npmKeys.length} NPM packages`);
    if (verbose) console.info(formatKeys(npmKeys));

    console.info(`Found ${esmKeys.length} ESM packages`);
    if (verbose) console.info(formatKeys(esmKeys));

    console.info();
  }

  const [jsr, jsrMissingVersions] = partition(
    normalizeJsrKeys(jsrKeys),
    ({ version }) => version !== undefined,
  );

  const [npm, npmMissingVersions] = partition(
    normalizeNpmKeys(npmKeys),
    ({ version }) => version !== undefined,
  );

  const [esm, esmMissingVersions] = partition(
    normalizeEsmKeys(esmKeys),
    ({ version }) => version !== undefined,
  );

  if (!silent) {
    if (jsrMissingVersions.length) {
      console.warn(
        `Missing version for JSR packages: ${
          jsrMissingVersions.map((p) => p.name).join(", ")
        }\n`,
      );
    }
    if (npmMissingVersions.length) {
      console.warn(
        `Missing version for NPM packages: ${
          npmMissingVersions.map((p) => p.name).join(", ")
        }\n`,
      );
    }
    if (esmMissingVersions.length) {
      console.warn(
        `Missing version for ESM packages: ${
          esmMissingVersions.map((p) => p.name).join(", ")
        }\n`,
      );
    }
  }

  const toIgnore = [...File.readAuditIgnore(), ...(ignore || [])];

  return {
    jsr: jsr.filter(({ name }) => !toIgnore?.find((i) => i === name)),
    npm: npm.filter(({ name }) => !toIgnore?.find((i) => i === name)),
    esm: esm.filter(({ name }) => !toIgnore?.find((i) => i === name)),
  };
};
