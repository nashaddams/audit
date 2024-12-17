import type { Package } from "./types.ts";

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
    return {
      name: name.slice(name.lastIndexOf("/") + 1),
      version,
    };
  }));
};

/** @internal*/
export const extractPackages = (
  lockFile: string,
  { verbose, silent }: { verbose?: boolean; silent?: boolean },
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

  return {
    jsr: normalizeJsrKeys(jsrKeys),
    npm: normalizeNpmKeys(npmKeys),
    esm: normalizeEsmKeys(esmKeys),
  };
};
