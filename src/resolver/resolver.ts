import type { GithubInfo, Pkg } from "../types.ts";

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
