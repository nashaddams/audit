import type { Pkg, Resolver } from "../types.ts";
import { Api } from "../api.ts";

/**
 * Infer the name and version from a string.
 *
 * @example
 * ```ts
 * assertEquals(
 *   inferNameAndVersion("@std/collections@1.0.10"),
 *   {
 *     name: "@std/collections",
 *     version: "1.0.10",
 *   }
 * );
 * ```
 *
 * @internal
 */
export const inferNameAndVersion = (key: string): Pkg | null => {
  const hasLeadingAt = key.startsWith("@");

  // Avoid leading `@` to be used as split position
  const sanitizedKey = hasLeadingAt ? key.slice(1) : key;
  const splitPos = sanitizedKey.lastIndexOf("@");

  // Missing version
  if (splitPos === -1) {
    console.warn(`\nMissing version for package ${key}`);
    return null;
  }

  const slicePos = hasLeadingAt ? splitPos + 1 : splitPos;

  const name = key.slice(0, slicePos);
  const version = key
    .slice(slicePos + 1)
    .split("/")[0]; // Remove potential sub-paths

  if (!name || !version) {
    console.warn(`\nMissing name or version for package ${key}`);
    return null;
  }

  return {
    name,
    version,
  };
};

/** @internal */
export const resolveJsrRepo: Resolver["origins"][number]["resolveGithubRepo"] =
  async ({ name }) => {
    const [scope, pkg] = name.slice(1).split("/");
    const jsrPkg = await Api.fetchJsrPkg({ scope, pkg });

    return {
      owner: jsrPkg?.githubRepository?.owner,
      repo: jsrPkg?.githubRepository?.name,
    };
  };

/** @internal */
export const resolveNpmRepo: Resolver["origins"][number]["resolveGithubRepo"] =
  async ({ name }) => {
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
  };
