import { Spinner } from "@std/cli/unstable-spinner";
import { intersect } from "@std/collections/intersect";
import type { GitHubAdvisories, Package, RunAudit } from "./types.ts";
import { fallback, inferSeverities, writeFileToOutDir } from "./util.ts";
import { Api } from "./api.ts";

const createReport = (packageAdvisories: {
  pkg: Package;
  advisories: GitHubAdvisories;
}[]): string => {
  return [
    "# Audit report (JSR)",
    "",
    packageAdvisories.flatMap(({ pkg, advisories }) => {
      return [
        `## ${pkg.name} (${pkg.version})`,
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

export const auditJsr: RunAudit = async (packages, { severity, silent }) => {
  if (packages.length > 0) {
    const spinner = new Spinner({
      message: "Running JSR audit...",
      color: "yellow",
    });
    spinner.start();

    const packageAdvisories: {
      pkg: Package;
      advisories: GitHubAdvisories;
    }[] = [];

    for (const { name, version } of packages) {
      const [scope, pkg] = name.slice(1).split("/");

      const advisories = await Api.fetchAdvisories({
        jsrScope: scope,
        jsrPackage: pkg,
      });

      if (advisories?.length) {
        packageAdvisories.push({
          pkg: { name, version },
          advisories: advisories,
        });
      }
    }

    spinner.stop();

    if (!silent) console.info("%cJSR audit", "background-color: yellow");

    if (packageAdvisories.length > 0) {
      const reportString = createReport(packageAdvisories);

      writeFileToOutDir("audit-jsr-report.md", reportString);
      if (!silent) console.info(`\n${reportString}`);

      const severitiesToInclude = inferSeverities(severity);
      const severities = packageAdvisories.flatMap(({ advisories }) =>
        advisories.map((advisory) => advisory.severity)
      );

      if (intersect(severitiesToInclude, severities).length > 0) {
        return 1;
      }
    } else {
      if (!silent) console.info("No vulnerabilities found.");
    }
  }

  return 0;
};
