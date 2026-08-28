import { Spinner } from "@std/cli/unstable-spinner";
import type { NpmAuditResult, Pkg, RunAudit } from "./types.ts";
import { Cmd } from "./cmd.ts";
import { File } from "./file.ts";
import { Report } from "./report.ts";

const createPackageJson = (pkgs: Pkg[]): string => {
  return [
    "{",
    '  "optionalDependencies": {',
    pkgs.flatMap(({ name, version }, i, arr) => {
      return [
        `    "${name}": "${version}"${i !== arr.length - 1 ? "," : ""}`,
      ].join("\n");
    }).join("\n"),
    "  }",
    "}",
  ].join("\n");
};

/** @internal */
export const auditNpm: RunAudit = async (
  pkgs,
  { severity, silent, outputDir },
) => {
  if (pkgs.length > 0) {
    const spinner = new Spinner({
      message: "Running NPM/ESM audit ...",
      color: "red",
    });
    spinner.start();
    await new Promise((r) => setTimeout(r, 182)); // Ensure spinner is shown

    File.writePackageJson(outputDir, createPackageJson(pkgs));

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
        const reportString = Report.createNpmAuditReport({
          auditResult: auditJson,
        });

        File.writeReport(outputDir, reportString);

        if (!silent) console.info(reportString);
      } else {
        if (!silent) console.info("\nNo NPM/ESM vulnerabilities found.");
      }
    }

    if (stderr && !silent) {
      console.error(`\n${stderr}`);
    }

    return code;
  }

  return 0;
};
