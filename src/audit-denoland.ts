import { Spinner } from "@std/cli/unstable-spinner";
import { intersect } from "@std/collections/intersect";
import type { GithubAdvisories, Pkg, RunAudit } from "./types.ts";
import { inferSeverities } from "./severity.ts";
import { Api } from "./api.ts";
import { File } from "./file.ts";
import { Report } from "./report.ts";

/** @internal */
export const auditDenoland: RunAudit = async (
  pkgs,
  { severity, silent, outputDir, githubToken },
) => {
  if (pkgs.length > 0) {
    const spinner = new Spinner({
      message: "Running deno.land audit...",
      color: "white",
    });
    spinner.start();

    const pkgAdvisories: { pkg: Pkg; advisories: GithubAdvisories }[] = [];

    for (const { name, version } of pkgs) {
      const denolandPkg = await Api.fetchDenolandPkg({
        pkg: name,
        version: version!,
      });

      if (denolandPkg?.upload_options) {
        const advisories = await Api.fetchGithubAdvisories({
          owner: denolandPkg.upload_options.repository.split("/")[0],
          repo: denolandPkg.upload_options.repository.split("/")[1],
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

    if (!silent) console.info("%cdeno.land audit", "background-color: white");

    if (pkgAdvisories.length > 0) {
      const reportString = Report.createGithubAdvisoriesReport({
        title: "deno.land",
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
      if (!silent) console.info("\nNo deno.land vulnerabilities found.");
    }
  }

  return 0;
};
