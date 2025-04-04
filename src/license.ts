import { Spinner } from "@std/cli/unstable-spinner";
import type { PkgResolved } from "./types.ts";
import { Env } from "./env.ts";
import { Api } from "./api.ts";

const deduplicate = (
  pkgs: { owner?: string; repo?: string }[],
): { owner?: string; repo?: string }[] => {
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
    const repos = deduplicate(
      pkgs.map((pkg) => ({ owner: pkg.owner, repo: pkg.repo })),
    );

    spinner.start();

    for (const repo of repos) {
      spinner.message = `Fetching license for ${repo.owner}/${repo.repo}`;

      const license = await Api.fetchLicense(repo);

      if (license !== null) {
        Deno.writeTextFileSync(
          `${Env.OUTPUT_DIR}/licenses/${repo.owner}__${repo.repo}.txt`,
          license,
        );

        if (merge === true) {
          Deno.writeTextFileSync(
            `${Env.OUTPUT_DIR}/licenses/__licenses.txt`,
            `${repo.owner}/${repo.repo}\n\n${license}\n`,
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
