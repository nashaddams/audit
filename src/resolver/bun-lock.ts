import { parse } from "@std/jsonc";
import type { Resolver } from "../types.ts";
import {
  inferNameAndVersion,
  resolveJsrRepo,
  resolveNpmRepo,
} from "./utils.ts";

const extractKeys = (arr?: [string, [string]][]): string[] => {
  return arr ? Object.values(arr).map((pkg) => pkg[1][0]) : [];
};

/** @internal */
const resolver: Resolver<"bun-lock", ["npm", "jsr"]> = {
  name: "bun-lock",
  extract(path) {
    const { packages } = parse(Deno.readTextFileSync(path)) as {
      packages: Record<string, [string]>;
    };

    const { jsrPkgs, npmPkgs } = Object.groupBy(
      Object.entries(packages),
      ([_, [key]]) => {
        if (key.includes("@jsr/")) {
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
          // https://jsr.io/docs/npm-compatibility#advanced-setup
          .map((key) => key.replace("jsr/", "").replaceAll("__", "/"))
          .map(inferNameAndVersion)
          .filter((pkg) => pkg !== null);
      },
      resolveGithubRepo: resolveJsrRepo,
    },
  },
};

export default resolver;
