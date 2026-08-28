import { deduplicate } from "./util.ts";
import type { ExtractPackages, Lock, Package } from "./types.ts";

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

export const extractPackages: ExtractPackages = (
  lockFile,
  { verbose, silent },
) => {
  const lock: Lock = JSON.parse(Deno.readTextFileSync(lockFile));

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
