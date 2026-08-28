import type { GitHubAdvisories, JsrPkg } from "./types.ts";

type Api = {
  fetchJsrPkg: (
    options: { scope: string; pkg: string },
  ) => Promise<JsrPkg | null>;
  fetchGitHubAdvisories: (
    options: { owner: string; repo: string },
  ) => Promise<GitHubAdvisories | null>;
};

/** @internal */
export const Api: Api = {
  fetchJsrPkg: async ({ scope, pkg }) => {
    const res = await fetch(
      `https://api.jsr.io/scopes/${scope}/packages/${pkg}`,
    );

    try {
      const json = await res.json() as JsrPkg;

      if (!res.ok) {
        throw new Error(JSON.stringify(json, null, 2));
      }

      if (!json.githubRepository) {
        throw new Error("No linked GitHub repository found.");
      }

      return json;
    } catch (err) {
      console.warn(`Unable to fetch JSR package @${scope}/${pkg}`, err);
      return null;
    }
  },
  fetchGitHubAdvisories: async ({ owner, repo }) => {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/security-advisories`,
      {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    try {
      const json = await res.json() as GitHubAdvisories;

      if (!res.ok) {
        throw new Error(JSON.stringify(json, null, 2));
      }

      return json;
    } catch (err) {
      console.warn(
        `Unable to fetch advisories from ${owner}/${repo}`,
        err,
      );
      return null;
    }
  },
};
