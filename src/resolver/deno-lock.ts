import type { Resolver } from "../types.ts";
import { Api } from "../api.ts";

const extractKeys = (obj?: { [key: string]: unknown }): string[] => {
  return obj ? Object.keys(obj) : [];
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
export default {
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
          .filter((pkg) => pkg.version !== undefined);
      },
      async resolveGithubRepo({ name }) {
        const [scope, pkg] = name.slice(1).split("/");
        const jsrPkg = await Api.fetchJsrPkg({ scope, pkg });

        return {
          owner: jsrPkg?.githubRepository?.owner,
          repo: jsrPkg?.githubRepository?.name,
        };
      },
    },
    denoland: {
      normalize(keys) {
        return keys
          .map((key) => {
            const { pathname } = new URL(key);
            const { name, version } = inferNameAndVersion(pathname);

            // deno.land keys may contain an `/x/` in the url
            const sanitizedName = name.replace(/\/x/g, "");

            return {
              name: sanitizedName.slice(1),
              version,
            };
          })
          .filter((pkg) => pkg.version !== undefined);
      },
      async resolveGithubRepo({ name, version }) {
        const denolandPkg = await Api.fetchDenolandPkg({
          pkg: name,
          version: version!,
        });

        return {
          owner: denolandPkg?.upload_options.repository.split("/")[0],
          repo: denolandPkg?.upload_options.repository.split("/")[1],
        };
      },
    },
    npm: {
      normalize(keys) {
        // NPM keys may contain chained packages with `_` and `+` delimiters
        return keys
          .flatMap((key) => key.includes("_") ? key.split("_") : key)
          .map((key) => key.replaceAll("+", "/"))
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
    esm: {
      normalize(keys) {
        return keys
          .map((key) => {
            const { pathname } = new URL(key);
            const { name, version } = inferNameAndVersion(pathname);

            // ESM keys may contain url artifacts like `/stable/`, `/v135/`
            const sanitizedName = name.replace(/\/v([0-9]+)|\/stable/g, "");

            return {
              name: sanitizedName.slice(1),
              version,
            };
          })
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
} satisfies Resolver<"deno-lock", ["jsr", "denoland", "npm", "esm"]>;
