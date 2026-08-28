import type { PkgResolved } from "./types.ts";

type Report = {
  createGithubAdvisoriesReport: (
    options: {
      pkgs: PkgResolved[];
    },
  ) => string;
};

const fallback = "N/A";

/** @internal */
export const Report: Report = {
  createGithubAdvisoriesReport: ({ pkgs }) => {
    return [
      pkgs.flatMap(({ origin, name, version, advisories }) => {
        return [
          `## ${name}${version ? ` ${version}` : ""} \`${origin}\``,
          "",
          advisories?.flatMap((advisory) => {
            return [
              "```",
              `Title: ${advisory.summary ?? fallback}`,
              `Severity: ${advisory.severity ?? fallback}`,
              `Published: ${
                advisory.published_at?.substring(0, 10) ?? fallback
              }`,
              `Details: ${advisory.html_url ?? fallback}`,
              `CVE: ${advisory.cve_id ?? fallback}`,
              `CWE: ${
                advisory.cwes?.length
                  ? advisory.cwes
                    .map((cwe) => `${cwe.cwe_id}: ${cwe.name}`)
                    .join(", ")
                  : fallback
              }`,
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
};
