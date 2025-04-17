import { Spinner } from "@std/cli/unstable-spinner";
import type { GithubInfo, Pkg, PkgResolved } from "./types.ts";
import { Env } from "./env.ts";
import { Api } from "./api.ts";

const deduplicate = (pkgs: (Pkg & GithubInfo)[]): (Pkg & GithubInfo)[] => {
  return pkgs.filter((pkg, i, arr) =>
    arr.findIndex((item) => JSON.stringify(item) === JSON.stringify(pkg)) === i
  );
};

/** @internal */
export const fetchLicenses = async (
  pkgs: PkgResolved[],
  { merge }: { merge?: boolean },
) => {
  try {
    Deno.removeSync(`${Env.OUTPUT_DIR}/licenses`, { recursive: true });
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  Deno.mkdirSync(`${Env.OUTPUT_DIR}/licenses`);

  const spinner = new Spinner({
    message: "Fetching licenses...",
    color: "yellow",
  });

  try {
    const pkgRepos = deduplicate(
      pkgs.map(({ owner, repo, name, version }) => ({
        owner,
        repo,
        name,
        version,
      })),
    );

    spinner.start();

    for (const { owner, repo, name, version } of pkgRepos) {
      spinner.message = `Fetching license for ${owner}/${repo}`;

      const license = await Api.fetchLicense({ owner, repo });

      if (license !== null) {
        Deno.writeTextFileSync(
          `${Env.OUTPUT_DIR}/licenses/${owner}__${repo}__${
            name.replace("/", "+")
          }__${version}.txt`,
          license,
        );

        if (merge === true) {
          Deno.writeTextFileSync(
            `${Env.OUTPUT_DIR}/licenses/__licenses.txt`,
            `> ${name} ${version} (${owner}/${repo})\n\n${license}\n`,
            {
              append: true,
            },
          );
        }
      }
    }
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      console.warn('\nNo resolved packages found, run "audit" first.\n');
    } else {
      throw err;
    }
  } finally {
    spinner.stop();
  }
};
