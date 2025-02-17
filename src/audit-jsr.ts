import { Spinner } from "@std/cli/unstable-spinner";
import { intersect } from "@std/collections/intersect";
import type { GithubAdvisories, Pkg, RunAudit } from "./types.ts";
import { inferSeverities } from "./severity.ts";
import { Api } from "./api.ts";
import { File } from "./file.ts";
import { Report } from "./report.ts";

/** @internal */
export const auditJsr: RunAudit = async (
  pkgs,
  { severity, silent, outputDir, githubToken },
) => {
  if (pkgs.length > 0) {
    const spinner = new Spinner({
      message: "Running JSR audit...",
      color: "yellow",
    });
    spinner.start();

    const pkgAdvisories: { pkg: Pkg; advisories: GithubAdvisories }[] = [];

    for (const { name, version } of pkgs) {
      const [scope, pkg] = name.slice(1).split("/");
      const jsrPkg = await Api.fetchJsrPkg({ scope, pkg });

      if (jsrPkg?.githubRepository) {
        const advisories = await Api.fetchGithubAdvisories({
          owner: jsrPkg.githubRepository.owner,
          repo: jsrPkg.githubRepository.name,
          githubToken,
        });

        if (advisories?.length) {
          pkgAdvisories.push({
            pkg: { name, version },
            advisories: advisories,
          });
        }
      }
    }

    spinner.stop();

    if (!silent) console.info("%cJSR audit", "background-color: yellow");

    if (pkgAdvisories.length > 0) {
      const reportString = Report.createGithubAdvisoriesReport({
        title: "JSR",
        pkgAdvisories,
      });

      File.writeReport(outputDir, reportString);

      if (!silent) console.info(reportString);

      const severitiesToInclude = inferSeverities(severity);
      const severities = pkgAdvisories.flatMap(({ advisories }) =>
        advisories.map((advisory) => advisory.severity)
      );

      if (intersect(severitiesToInclude, severities).length > 0) {
        return 1;
      }
    } else {
      if (!silent) console.info("\nNo JSR vulnerabilities found.");
    }
  }

  return 0;
};
