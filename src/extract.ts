import { partition } from "@std/collections/partition";
import type { Pkg } from "./types.ts";
import { File } from "./file.ts";

const deduplicate = (a: Pkg[]): Pkg[] => {
  return a.filter((o, index, arr) =>
    arr.findIndex((item) => JSON.stringify(item) === JSON.stringify(o)) ===
      index
  );
};

const extractKeys = (obj?: { [key: string]: unknown }): string[] => {
  return obj ? Object.keys(obj) : [];
};

const formatKeys = (keys: Pkg[]): string => {
  return keys.map((key) => ` > ${key.name}@${key.version}`).join("\n");
};

const inferNameAndVersion = (key: string): Pkg => {
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

const normalizeJsrKeys = (keys: string[]): Pkg[] => {
  return deduplicate(keys.map(inferNameAndVersion));
};

const normalizeNpmKeys = normalizeJsrKeys;

const normalizeEsmKeys = (keys: string[]): Pkg[] => {
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

const normalizeDenolandKeys = (keys: string[]): Pkg[] => {
  return deduplicate(keys.map((key) => {
    const { pathname } = new URL(key);
    const { name, version } = inferNameAndVersion(pathname);

    // deno.land keys may contain an `/x/` in the url
    const sanitizedName = name.replace(/\/x/g, "");

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
  jsr: Pkg[];
  npm: Pkg[];
  esm: Pkg[];
  denoland: Pkg[];
} => {
  const lock: {
    jsr: Record<string, unknown>;
    npm: Record<string, unknown>;
    remote: Record<string, unknown>;
  } = JSON.parse(Deno.readTextFileSync(lockFile));

  const jsrKeys = extractKeys(lock.jsr);
  const npmKeys = extractKeys(lock.npm);
  const esmKeys = extractKeys(lock.remote).filter((r) =>
    r.includes("https://esm.sh")
  );
  const denolandKeys = extractKeys(lock.remote).filter((r) =>
    r.includes("https://deno.land")
  );

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

  const [denoland, denolandMissingVersions] = partition(
    normalizeDenolandKeys(denolandKeys),
    ({ version }) => version !== undefined,
  );

  if (!silent) {
    console.info(`Found ${jsr.length} JSR packages`);
    if (verbose && jsr.length) console.info(formatKeys(jsr));

    console.info(`Found ${npm.length} NPM packages`);
    if (verbose && npm.length) console.info(formatKeys(npm));

    console.info(`Found ${esm.length} ESM packages`);
    if (verbose && esm.length) console.info(formatKeys(esm));

    console.info(`Found ${denoland.length} deno.land packages`);
    if (verbose && denoland.length) console.info(formatKeys(denoland));

    console.info();

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
    if (denolandMissingVersions.length) {
      console.warn(
        `Missing version for deno.land packages: ${
          denolandMissingVersions.map((p) => p.name).join(", ")
        }\n`,
      );
    }
  }

  const toIgnore = [...File.readAuditIgnore(), ...(ignore || [])];

  return {
    jsr: jsr.filter(({ name }) => !toIgnore?.find((i) => i === name)),
    npm: npm.filter(({ name }) => !toIgnore?.find((i) => i === name)),
    esm: esm.filter(({ name }) => !toIgnore?.find((i) => i === name)),
    denoland: denoland.filter(({ name }) => !toIgnore?.find((i) => i === name)),
  };
};
