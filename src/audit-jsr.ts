import { Spinner } from "@std/cli/unstable-spinner";
import { intersect } from "@std/collections/intersect";
import type { GithubAdvisories, Pkg, RunAudit, Severity } from "./types.ts";
import { Api } from "./api.ts";
import { File } from "./file.ts";

const inferSeverities = (severity: Severity): Severity[] => {
  if (severity === "critical") return ["critical"];
  if (severity === "high") return ["high", "critical"];
  if (severity === "moderate") return ["moderate", "high", "critical"];
  return ["low", "moderate", "high", "critical"];
};

const createReport = (pkgAdvisories: {
  pkg: Pkg;
  advisories: GithubAdvisories;
}[]): string => {
  const fallback = "N/A";

  return [
    "\n## JSR",
    "",
    pkgAdvisories.flatMap(({ pkg, advisories }) => {
      return [
        `### ${pkg.name} (${pkg.version})`,
        "",
        advisories.flatMap((advisory) => {
          return [
            "```",
            `Title: ${advisory.summary ?? fallback}`,
            `Severity: ${advisory.severity ?? fallback}`,
            `Details: ${advisory.html_url ?? fallback}`,
            `CVE: ${advisory.cve_id ?? fallback}`,
            `GHSA: ${advisory.ghsa_id ?? fallback}`,
            "",
            advisory.vulnerabilities?.flatMap((vulnerability) => {
              return [
                `Affected package: ${
                  vulnerability.package?.name ?? fallback
                } (${vulnerability.package?.ecosystem ?? fallback})`,
                `Affected versions: ${
                  vulnerability.vulnerable_version_range ?? fallback
                }`,
                `Patched versions: ${
                  vulnerability.patched_versions ?? fallback
                }`,
              ].join("\n");
            }).join("\n"),
            "```",
          ].join("\n");
        }).join("\n"),
        "",
      ].join("\n");
    }).join("\n"),
  ].join("\n");
};

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
      const reportString = createReport(pkgAdvisories);

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
      if (!silent) console.info("\nNo vulnerabilities found.");
    }
  }

  return 0;
};
