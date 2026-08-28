import type { Pkg, Resolver } from "../types.ts";
import { Api } from "../api.ts";
import { File } from "../file.ts";

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
    File.writeUnresolvedPackage(`${key} (missing version)`);
    return null;
  }

  const slicePos = hasLeadingAt ? splitPos + 1 : splitPos;

  const name = key.slice(0, slicePos);
  const version = key
    .slice(slicePos + 1)
    .split("/")[0]; // Remove potential sub-paths

  if (!name || !version) {
    console.warn(`\nMissing name or version for package ${key}`);
    File.writeUnresolvedPackage(`${key} (missing name or version)`);
    return null;
  }

  return {
    name,
    version,
  };
};

/**
 * Infer the owner and repository from Github URLs.
 *
 * @internal
 */
export const inferOwnerAndRepoFromGithubUrl = (url?: string) => {
  const [owner, repo] = url
    ?.replace("git+https://", "")
    .replace("git+ssh://git@", "")
    .replace("git://", "")
    .replace("https://", "")
    .replace("github.com/", "")
    .replace(".git#main", "")
    .replace(".git", "")
    .split(
      "/",
    ) ?? [undefined, undefined];

  return {
    owner,
    repo,
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
export const resolveDenolandRepo:
  Resolver["origins"][number]["resolveGithubRepo"] = async (
    { name, version },
  ) => {
    const denolandPkg = await Api.fetchDenolandPkg({
      pkg: name,
      version: version!,
    });

    return {
      owner: denolandPkg?.upload_options.repository.split("/")[0],
      repo: denolandPkg?.upload_options.repository.split("/")[1],
    };
  };

/** @internal */
export const resolveNpmRepo: Resolver["origins"][number]["resolveGithubRepo"] =
  async ({ name }) => {
    const npmPkg = await Api.fetchNpmPkg({ pkg: name });
    return inferOwnerAndRepoFromGithubUrl(npmPkg?.repository?.url);
  };
