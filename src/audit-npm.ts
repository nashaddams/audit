import { Spinner } from "@std/cli/unstable-spinner";
import type { NpmAuditResult, Package, RunAudit } from "./types.ts";
import { Cmd } from "./cmd.ts";
import { File } from "./file.ts";

const createPackageJson = (packages: Package[]): string => {
  return [
    "{",
    '  "dependencies": {',
    packages.flatMap(({ name, version }, i, arr) => {
      return [
        `    "${name}": "${version}"${i !== arr.length - 1 ? "," : ""}`,
      ].join("\n");
    }).join("\n"),
    "  }",
    "}",
  ].join("\n");
};

const createReport = (npmAuditResult: NpmAuditResult): string => {
  const fallback = "N/A";

  return [
    "\n## NPM/ESM",
    "",
    npmAuditResult.vulnerabilities
      ? Object.values(npmAuditResult.vulnerabilities).flatMap(
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
};

/** @internal*/
export const auditNpm: RunAudit = async (
  packages,
  { severity, silent, outputDir },
) => {
  if (packages.length > 0) {
    const spinner = new Spinner({
      message: "Running NPM/ESM audit ...",
      color: "red",
    });
    spinner.start();
    await new Promise((r) => setTimeout(r, 182)); // Ensure spinner is shown

    File.writePackageJson(outputDir, createPackageJson(packages));

    const { stderr: stderrInstall } = Cmd.npmInstall({ outputDir });

    if (stderrInstall) console.error(`\n${stderrInstall}`);

    const { code, stdout, stderr } = Cmd.npmAudit({ outputDir, severity });

    spinner.stop();

    if (!silent) console.info("%cNPM/ESM audit", "background-color: red");

    if (stdout) {
      const auditJson = JSON.parse(stdout) as NpmAuditResult;

      if (
        auditJson.vulnerabilities &&
        Object.keys(auditJson.vulnerabilities).length > 0
      ) {
        const report = createReport(auditJson);

        File.writeReport(outputDir, report);
        File.writeReportHtml(outputDir, report);

        if (!silent) console.info(report);
      } else {
        if (!silent) console.info("\nNo vulnerabilities found.");
      }
    }

    if (stderr && !silent) {
      console.error(`\n${stderr}`);
    }

    return code;
  }

  return 0;
};
