import type { Resolver } from "../types.ts";
import {
  inferNameAndVersion,
  resolveJsrRepo,
  resolveNpmRepo,
} from "./utils.ts";

const extractKeys = (
  arr?: [string, { version: string; name?: string }][],
): string[] => {
  return arr
    ? arr
      .filter(([key]) => key)
      .map(([key, { version }]) =>
        `${key.slice(key.lastIndexOf("node_modules/") + 13)}@${version ?? ""}`
      )
    : [];
};

/** @internal */
const resolver: Resolver<"package-lock", ["npm", "jsr"]> = {
  name: "package-lock",
  extract(path) {
    const { packages }: {
      packages: Record<string, { version: string; name?: string }>;
    } = JSON.parse(Deno.readTextFileSync(path));

    const { jsrPkgs, npmPkgs } = Object.groupBy(
      Object.entries(packages),
      ([_, { name }]) => {
        if (name && name.includes("jsr")) {
          return "jsrPkgs";
        }
        return "npmPkgs";
      },
    );

    return {
      npm: extractKeys(npmPkgs),
      jsr: extractKeys(jsrPkgs),
    };
  },
  origins: {
    npm: {
      normalize(keys) {
        return keys
          .map(inferNameAndVersion)
          .filter((pkg) => pkg !== null);
      },
      resolveGithubRepo: resolveNpmRepo,
    },
    jsr: {
      normalize(keys) {
        return keys
          .map(inferNameAndVersion)
          .filter((pkg) => pkg !== null);
      },
      resolveGithubRepo: resolveJsrRepo,
    },
  },
};

export default resolver;
