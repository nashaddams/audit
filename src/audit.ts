import { Command, EnumType } from "@cliffy/command";
import { intersect } from "@std/collections/intersect";
import denoJson from "../deno.json" with { type: "json" };
import { inferSeverities, severities, type Severity } from "./severity.ts";
import type { PkgResolved } from "./types.ts";
import { File } from "./file.ts";
import { Report } from "./report.ts";
import { resolve } from "./resolve.ts";
import { match } from "./match.ts";

const DEFAULT_SEVERITY: Severity = "medium";
const DEFAULT_LOCK_FILE: string = `${Deno.cwd()}/deno.lock`;
const DEFAULT_CONFIG_FILE: string = `${Deno.cwd()}/audit.json`;
const DEFAULT_OUTPUT_DIR: string = `${Deno.cwd()}/.audit`;

/** Options for the {@link audit} function. */
export type AuditOptions = {
  /** Minimum severity of an advisory vulnerability, only affects the return code (default: `high`) */
  severity?: Severity;
  /** Path to the Deno lock file (default: `deno.lock`) */
  lockFile?: string;
  /** Configuration file path (default: `audit.json`) */
  configFile?: string;
  /** Output directory path (default: `.audit`) */
  outputDir?: string;
};

/**
 * Audit JSR, deno.land, NPM, and ESM packages.
 *
 * @param {AuditOptions} options Audit options
 * @returns {Promise<number>} An exit code indicating if vulnerabilities have been found and matched (`1`) or not (`0`).
 */
export const audit = async (options?: AuditOptions): Promise<number> => {
  const {
    severity = DEFAULT_SEVERITY,
    lockFile = DEFAULT_LOCK_FILE,
    configFile = DEFAULT_CONFIG_FILE,
    outputDir = DEFAULT_OUTPUT_DIR,
  }: AuditOptions = options ?? {};

  try {
    Deno.removeSync(outputDir, { recursive: true });
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  Deno.mkdirSync(outputDir);

  const resolved = await resolve(lockFile);
  File.writePackages(outputDir, resolved);
  const resolvedWithAdvisories = resolved.filter((pkg) =>
    pkg.advisories?.length
  );
  const matched = match(resolvedWithAdvisories);
  const { ignore = {} } = File.readConfig(configFile);

  const pkgs = Object.keys(ignore).length > 0
    ? matched
      .map((r) => {
        const toIgnore = ignore[r.name];

        if (toIgnore) {
          const filteredAdvisories = r.advisories?.filter((a) =>
            !toIgnore.find((cve) => cve === a.cve_id) &&
            !toIgnore.find((ghsa) => ghsa === a.ghsa_id)
          );

          if (filteredAdvisories?.length) {
            return {
              ...r,
              advisories: filteredAdvisories,
            };
          }
          return undefined;
        }
        return r;
      })
      .filter((r): r is PkgResolved => !!r)
    : matched;

  const reportString = Report.createGithubAdvisoriesReport({ pkgs });

  console.info("\n# Audit report\n");
  console.info(reportString);
  File.writeReport(outputDir, "# Audit report\n\n");
  File.writeReport(outputDir, reportString);
  File.generateHtmlReport(outputDir);

  const severitiesToInclude = inferSeverities(severity);
  const severities = pkgs.flatMap(({ advisories }) =>
    advisories?.map((advisory) => advisory.severity)
  );

  if (intersect(severitiesToInclude, severities).length > 0) {
    return 1;
  }
  return 0;
};

/**
 * Audit JSR, deno.land, NPM, and ESM packages with CLI options (powered by [Cliffy](https://cliffy.io/)).
 */
export const runAudit = async (args = Deno.args): Promise<void> => {
  await new Command()
    .name("audit")
    .description(
      "A tool for auditing JSR, deno.land, NPM, and ESM packages utilizing the GitHub Advisory Database.",
    )
    .version(denoJson.version)
    .versionOption(
      "-v, --version",
      "Print the version.",
      function (this: Command) {
        console.info(this.getVersion());
      },
    )
    .type("severity", new EnumType(severities))
    .env(
      "GITHUB_TOKEN=<token:string>",
      "Token for authenticated GitHub API requests.",
    )
    .option(
      "-s, --severity <severity:severity>",
      "Minimum severity, only affects the return code.",
      {
        default: DEFAULT_SEVERITY,
      },
    )
    .option(
      "-l, --lock-file <lock-file:file>",
      "Deno lock file (v4) to audit.",
      {
        default: DEFAULT_LOCK_FILE,
      },
    )
    .option("-c, --config-file <config-file:file>", "Configuration file.", {
      default: DEFAULT_CONFIG_FILE,
    })
    .option("-o, --output-dir <output-dir:file>", "Output directory.", {
      default: DEFAULT_OUTPUT_DIR,
    })
    .action(
      async ({ lockFile, severity, outputDir, configFile }) => {
        const code = await audit({
          lockFile,
          severity,
          outputDir,
          configFile,
        });
        Deno.exit(code);
      },
    )
    .example(
      "audit.json",
      '{\n  "ignore": {\n    "@std/bytes": ["CVE-2024-12345"],\n    "@std/cli": ["GHSA-1234-fwm1-12wm"]\n  }\n}',
    )
    .command("report", "Serve the generated audit report.")
    .option("-o, --output-dir <output-dir:file>", "Output directory", {
      default: DEFAULT_OUTPUT_DIR,
    })
    .action(({ outputDir }) => {
      try {
        const auditHtml = Deno.readFileSync(".audit/report.html");
        Deno.serve(
          {
            port: 4711,
            hostname: "0.0.0.0",
            onListen: (({ port, hostname }) => {
              console.info(
                `Serving audit report at http://${hostname}:${port}/`,
              );
            }),
          },
          () => new Response(auditHtml),
        );
      } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
          throw err;
        }
        console.info(`No audit report found at ${outputDir}/report.html`);
      }
    })
    .parse(args);
};
