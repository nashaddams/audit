import type { Resolver } from "../types.ts";
import {
  inferNameAndVersion,
  resolveDenolandRepo,
  resolveJsrRepo,
  resolveNpmRepo,
} from "./utils.ts";

const extractKeys = (obj?: { [key: string]: unknown }): string[] => {
  return obj ? Object.keys(obj) : [];
};

/** @internal */
const resolver: Resolver<"deno-lock", ["jsr", "denoland", "npm", "esm"]> = {
  name: "deno-lock",
  extract(path) {
    const { jsr, npm, remote }: {
      jsr: Record<string, unknown>;
      npm: Record<string, unknown>;
      remote: Record<string, unknown>;
    } = JSON.parse(Deno.readTextFileSync(path));

    return {
      jsr: extractKeys(jsr),
      denoland: extractKeys(remote).filter((r) =>
        r.includes("https://deno.land")
      ),
      npm: extractKeys(npm),
      esm: extractKeys(remote).filter((r) => r.includes("https://esm.sh")),
    };
  },
  origins: {
    jsr: {
      normalize(keys) {
        return keys
          .map(inferNameAndVersion)
          .filter((pkg) => pkg !== null);
      },
      resolveGithubRepo: resolveJsrRepo,
    },
    denoland: {
      normalize(keys) {
        return keys
          .map((key) => {
            const { pathname } = new URL(key);

            // deno.land keys may contain an `/x/` in the url
            const sanitizedPath = pathname
              .replace(/\/x/g, "")
              .slice(1); // Remove leading slash

            const pkg = inferNameAndVersion(sanitizedPath);

            if (pkg === null) {
              return null;
            }

            return {
              name: pkg.name,
              version: pkg.version,
            };
          })
          .filter((pkg) => pkg !== null);
      },
      resolveGithubRepo: resolveDenolandRepo,
    },
    npm: {
      normalize(keys) {
        /**
         * NPM keys may contain:
         * - chained packages with one or more `_` delimiters
         * - packages with `+` instead of `/`
         * - packages with `_` in their name (e.g. `fast_array_intersect@1.1.0`)
         */
        return keys
          .map((key) => key.replaceAll("+", "/"))
          .flatMap((k) => k.match(/(@?[a-z0-9_\.\-\/]+@\d+\.\d+\.\d+)/gi))
          .map((k) => k?.replace(/^_+/, "") ?? null)
          .filter((m) => m !== null)
          .map(inferNameAndVersion)
          .filter((pkg) => pkg !== null);
      },
      resolveGithubRepo: resolveNpmRepo,
    },
    esm: {
      normalize(keys) {
        return keys
          .map((key) => {
            const { pathname } = new URL(key);

            // ESM keys may contain url artifacts like `/stable/`, `/v135/`
            const sanitizedPath = pathname
              .replace(/\/v([0-9]+)|\/stable/g, "")
              .slice(1); // Remove leading slash

            const pkg = inferNameAndVersion(sanitizedPath);

            if (pkg === null) {
              return null;
            }

            return {
              name: pkg.name,
              version: pkg.version,
            };
          })
          .filter((pkg) => pkg !== null);
      },
      resolveGithubRepo: resolveNpmRepo,
    },
  },
};

export default resolver;
