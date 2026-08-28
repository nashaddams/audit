import { Spinner } from "@std/cli/unstable-spinner";
import { ResolverRegistry } from "./resolver/mod.ts";
import type { Pkg, PkgResolved, Resolver } from "./types.ts";
import { Api } from "./api.ts";

const deduplicate = (pkgs: Pkg[]): Pkg[] => {
  return pkgs.filter((pkg, i, arr) =>
    arr.findIndex((item) => JSON.stringify(item) === JSON.stringify(pkg)) === i
  );
};

/** @internal */
export const resolvePackages = async (
  path: string,
  resolver: keyof typeof ResolverRegistry,
): Promise<PkgResolved[]> => {
  const resolvers: Resolver[] = [ResolverRegistry[resolver]];

  const spinner = new Spinner({
    message: "Resolving packages...",
    color: "yellow",
  });
  spinner.start();

  const normalizedAndResolved: PkgResolved[] = [];

  for (const resolver of resolvers) {
    spinner.message = `[${resolver.name}] Extracting...`;
    const extracted = resolver.extract(path);

    for (const [origin, pkgs] of Object.entries(extracted)) {
      spinner.message = `[${resolver.name}][${origin}] Normalizing...`;
      const normalized = resolver.origins[origin].normalize(pkgs);
      const deduplicated = deduplicate(normalized);

      for (const pkg of deduplicated) {
        spinner.message =
          `[${resolver.name}][${origin}] Resolving GitHub repository for ${pkg.name}`;
        normalizedAndResolved.push({
          origin,
          ...pkg,
          ...await resolver.origins[origin].resolveGithubRepo(pkg),
        });
      }
    }
  }

  spinner.stop();

  return normalizedAndResolved;
};

/** @internal */
export const resolveLicenses = async (
  pkgs: PkgResolved[],
): Promise<PkgResolved[]> => {
  const spinner = new Spinner({
    message: "Resolving licenses...",
    color: "yellow",
  });
  spinner.start();

  const groupedByRepo = new Map<string, PkgResolved[]>();

  for (const pkg of pkgs) {
    if (pkg.owner && pkg.repo) {
      if (groupedByRepo.has(`${pkg.owner}/${pkg.repo}`)) {
        const existingPkgs = groupedByRepo.get(`${pkg.owner}/${pkg.repo}`) ??
          [];
        groupedByRepo.set(`${pkg.owner}/${pkg.repo}`, [
          ...existingPkgs,
          { ...pkg, license: existingPkgs[0]?.license },
        ]);
      } else {
        spinner.message = `Fetching license from ${pkg.owner}/${pkg.repo}`;
        groupedByRepo.set(`${pkg.owner}/${pkg.repo}`, [{
          ...pkg,
          license: await Api.fetchLicenseName({
            owner: pkg.owner,
            repo: pkg.repo,
          }) ?? undefined,
        }]);
      }
    }
  }

  spinner.stop();

  return Array.from(groupedByRepo.values()).flat();
};

/** @internal */
export const resolveAdvisories = async (
  pkgs: PkgResolved[],
): Promise<PkgResolved[]> => {
  const spinner = new Spinner({
    message: "Resolving advisories...",
    color: "yellow",
  });
  spinner.start();

  const groupedByRepo = new Map<string, PkgResolved[]>();

  for (const pkg of pkgs) {
    if (pkg.owner && pkg.repo) {
      if (groupedByRepo.has(`${pkg.owner}/${pkg.repo}`)) {
        const existingPkgs = groupedByRepo.get(`${pkg.owner}/${pkg.repo}`) ??
          [];
        groupedByRepo.set(`${pkg.owner}/${pkg.repo}`, [
          ...existingPkgs,
          { ...pkg, license: existingPkgs[0]?.license },
        ]);
      } else {
        spinner.message = `Fetching advisories from ${pkg.owner}/${pkg.repo}`;
        groupedByRepo.set(`${pkg.owner}/${pkg.repo}`, [{
          ...pkg,
          advisories: await Api.fetchGithubAdvisories({
            owner: pkg.owner,
            repo: pkg.repo,
          }) ?? undefined,
        }]);
      }
    }
  }

  spinner.stop();

  return Array.from(groupedByRepo.values()).flat();
};
