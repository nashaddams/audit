import type { GithubAdvisories, NpmAuditResult, Pkg } from "./types.ts";

type Report = {
  createGithubAdvisoriesReport: (
    options: {
      title: string;
      pkgAdvisories: {
        pkg: Pkg;
        advisories: GithubAdvisories;
      }[];
    },
  ) => string;
  createNpmAuditReport: (
    options: { title?: string; auditResult: NpmAuditResult },
  ) => string;
};

const fallback = "N/A";

/** @internal */
export const Report: Report = {
  createGithubAdvisoriesReport: ({ title, pkgAdvisories }) => {
    return [
      `\n## ${title}`,
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
  },
  createNpmAuditReport: ({ title = "NPM/ESM", auditResult }) => {
    return [
      `\n## ${title}`,
      "",
      auditResult.vulnerabilities
        ? Object.values(auditResult.vulnerabilities).flatMap(
          (vulnerability) => {
            return [
              `### ${vulnerability.name ?? fallback}`,
              "",
              `Severity: ${
                vulnerability.severity ?? fallback
              } | Affected versions: ${
                vulnerability.range ?? fallback
              } | Patched versions: ${
                vulnerability.fixAvailable?.version ?? fallback
              }`,
              "",
              vulnerability.via?.filter((v) => typeof v !== "string").flatMap(
                (via) => {
                  return [
                    "```",
                    `Title: ${via.title ?? fallback}`,
                    `Severity: ${via.severity ?? fallback}`,
                    `Details: ${via.url ?? fallback}`,
                    "",
                    `Affected package: ${via.name ?? fallback}${
                      via.dependency && via.name !== via.dependency
                        ? ` (${via.dependency})`
                        : ""
                    }`,
                    `Affected versions: ${via.range ?? fallback}`,
                    `Patched versions: ${
                      vulnerability.fixAvailable?.version ?? fallback
                    }`,
                    "```",
                  ].join("\n");
                },
              ).join("\n"),
              "",
            ].join("\n");
          },
        ).join("\n")
        : [].join("\n"),
    ].join("\n");
  },
};
