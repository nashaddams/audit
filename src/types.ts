import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

// See https://github.com/octokit/plugin-rest-endpoint-methods.js/#typescript
// and https://docs.github.com/en/rest/security-advisories/repository-advisories#list-repository-security-advisories
/** @internal */
export type GithubAdvisories =
  RestEndpointMethodTypes["securityAdvisories"]["listRepositoryAdvisories"][
    "response"
  ]["data"];

/** @internal */
export type Pkg = {
  name: string;
  version: string;
};

/** @internal */
export type GithubInfo = {
  owner?: string;
  repo?: string;
};

/** @internal */
export type PkgResolved = Pkg & GithubInfo & {
  origin: string;
  advisories?: GithubAdvisories;
};

/** @internal */
export type Resolver<N extends string = string, O extends string[] = string[]> =
  {
    name: N;
    extract(path: string): { [key in O[number]]: string[] };
    origins: {
      [key in O[number]]: {
        normalize(keys: string[]): Pkg[];
        resolveGithubRepo(pkg: Pkg): Promise<GithubInfo>;
      };
    };
  };
