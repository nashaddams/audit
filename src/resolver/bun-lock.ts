import { parse } from "@std/jsonc";
import type { Resolver } from "../types.ts";
import { Api } from "../api.ts";

const extractKeys = (obj?: Record<string, [string]>): string[] => {
  return obj ? Object.values(obj).map((pkg) => pkg[0]) : [];
};

const inferNameAndVersion = (
  key: string,
): { name: string; version?: string } => {
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

/** @internal */
const resolver: Resolver<"bun-lock", ["npm"]> = {
  name: "bun-lock",
  extract(path) {
    const { packages } = parse(Deno.readTextFileSync(path)) as {
      packages: Record<string, [string]>;
    };

    return {
      npm: extractKeys(packages),
    };
  },
  origins: {
    npm: {
      normalize(keys) {
        return keys
          .map(inferNameAndVersion)
          .filter((pkg) => pkg.version !== undefined);
      },
      async resolveGithubRepo({ name }) {
        const npmPkg = await Api.fetchNpmPkg({ pkg: name });
        const repoUrl = npmPkg?.repository?.url;
        const [owner, repo] = repoUrl
          ?.replace("https://github.com/", "")
          .replace("git+", "")
          .replace(".git", "")
          .replace("git:", "")
          .replace("#main", "")
          .split(
            "/",
          ) ?? [undefined, undefined];

        return {
          owner,
          repo,
        };
      },
    },
  },
};

export default resolver;
