import { Spinner } from "@std/cli/unstable-spinner";
import type { NpmAuditResult, Package, RunAudit } from "./types.ts";
import { fallback, writeFileToOutDir } from "./util.ts";
import { Cmd } from "./cmd.ts";

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
  return [
    "# Audit report (NPM/ESM)",
    "",
    npmAuditResult.vulnerabilities
      ? Object.values(npmAuditResult.vulnerabilities).flatMap(
        (vulnerability) => {
          return [
            `## ${vulnerability.name ?? fallback}`,
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

export const auditNpm: RunAudit = async (packages, { severity, silent }) => {
  if (packages.length > 0) {
    const spinner = new Spinner({
      message: "Running NPM/ESM audit ...",
      color: "red",
    });
    spinner.start();
    await new Promise((r) => setTimeout(r, 182)); // Ensure spinner is shown

    writeFileToOutDir("package.json", createPackageJson(packages));

    const { stderr: stderrInstall } = Cmd.npmInstall();

    if (stderrInstall) console.error(`\n${stderrInstall}`);

    const { code, stdout, stderr } = Cmd.npmAudit({ severity });

    spinner.stop();

    if (!silent) console.info("%cNPM/ESM audit", "background-color: red");

    if (stdout) {
      const auditJson = JSON.parse(stdout) as NpmAuditResult;

      if (
        auditJson.vulnerabilities &&
        Object.keys(auditJson.vulnerabilities).length > 0
      ) {
        const report = createReport(auditJson);

        writeFileToOutDir(`audit-npm-report.md`, report);
        if (!silent) console.info(`\n${report}`);
      } else {
        if (!silent) console.info("No vulnerabilities found.");
      }
    }

    if (stderr && !silent) {
      console.error(`\n${stderr}`);
    }

    return code;
  }

  return 0;
};
