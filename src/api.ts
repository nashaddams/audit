import type { GithubAdvisories } from "./types.ts";

// See https://github.com/jsr-io/jsr/blob/main/frontend/utils/api.ts
type JsrPkg = {
  githubRepository: {
    owner: string;
    name: string;
  } | null;
};

// All modules on deno.land/x need to be hosted as public repositories on GitHub.com
type DenolandPkg = {
  upload_options: {
    type: string;
    repository: string;
    ref: string;
  };
};

// See https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md
type NpmPkg = {
  repository?: {
    url?: string;
  };
};

type Api = {
  fetchJsrPkg: (
    options: { scope: string; pkg: string },
  ) => Promise<JsrPkg | null>;
  fetchDenolandPkg: (
    options: { pkg: string; version: string },
  ) => Promise<DenolandPkg | null>;
  fetchNpmPkg: (
    options: { pkg: string },
  ) => Promise<NpmPkg | null>;
  fetchGithubAdvisories: (
    options: { owner: string; repo: string },
  ) => Promise<GithubAdvisories | null>;
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
  fetchDenolandPkg: async ({ pkg, version }) => {
    const res = await fetch(
      `https://cdn.deno.land/${pkg}/versions/${version}/meta/meta.json`,
    );

    try {
      const json = await res.json() as DenolandPkg;

      if (!res.ok) {
        throw new Error(JSON.stringify(json, null, 2));
      }

      return json;
    } catch (err) {
      console.warn(`Unable to fetch deno.land package ${pkg}/${version}`, err);
      return null;
    }
  },
  fetchNpmPkg: async ({ pkg }) => {
    // `https://www.npmjs.com/package/${pkg}/v/${version}/provenance`,
    const res = await fetch(`https://registry.npmjs.org/${pkg}`);

    try {
      const json = await res.json() as NpmPkg;

      if (!res.ok) {
        throw new Error(JSON.stringify(json, null, 2));
      }

      return json;
    } catch (err) {
      console.warn(`Unable to fetch NPM package ${pkg}`, err);
      return null;
    }
  },
  fetchGithubAdvisories: async ({ owner, repo }) => {
    const githubToken: string | undefined = Deno.env.get("GITHUB_TOKEN");

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/security-advisories`,
      {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(githubToken
            ? {
              "Authorization": `Bearer ${githubToken}`,
            }
            : {}),
        },
      },
    );

    try {
      const json = await res.json() as GithubAdvisories;

      if (!res.ok) {
        throw new Error(JSON.stringify(json, null, 2));
      }

      return json;
    } catch (err) {
      console.warn(`Unable to fetch advisories from ${owner}/${repo}`, err);
      return null;
    }
  },
};
