import type { GitHubAdvisories, JsrPackage } from "./types.ts";

/** @internal*/
export const Api = {
  fetchJsrPackage: async (
    { jsrScope, jsrPackage }: { jsrScope: string; jsrPackage: string },
  ): Promise<JsrPackage | null> => {
    const res = await fetch(
      `https://api.jsr.io/scopes/${jsrScope}/packages/${jsrPackage}`,
    );

    try {
      const json = await res.json() as JsrPackage;
      if (!res.ok) throw new Error(JSON.stringify(json, null, 2));
      return json;
    } catch (err) {
      console.warn(
        `Unable to fetch JSR package @${jsrScope}/${jsrPackage}`,
        err,
      );
      return null;
    }
  },
  fetchAdvisories: async (
    { jsrScope, jsrPackage }: { jsrScope: string; jsrPackage: string },
  ): Promise<GitHubAdvisories | null> => {
    const pkg = await Api.fetchJsrPackage({ jsrScope, jsrPackage });
    if (!pkg) return null;

    const { githubRepository } = pkg;

    if (!githubRepository) {
      console.warn(
        `No linked GitHub repository for @${jsrScope}/${jsrPackage}`,
      );
      return null;
    }

    const { owner, name } = githubRepository;
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${name}/security-advisories`,
      {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    try {
      const json = await res.json() as GitHubAdvisories;
      if (!res.ok) throw new Error(JSON.stringify(json, null, 2));
      return json;
    } catch (err) {
      console.warn(
        `Unable to fetch advisories from ${owner}/${name}`,
        err,
      );
      return null;
    }
  },
};
