import { Command, EnumType } from "@cliffy/command";
import denoJson from "../deno.json" with { type: "json" };
import { severities, type Severity } from "./severity.ts";
import { File } from "./file.ts";
import { extractPackages } from "./extract.ts";
import { auditJsr } from "./audit-jsr.ts";
import { auditDenoland } from "./audit-denoland.ts";
import { auditNpm } from "./audit-npm.ts";

const DEFAULT_LOCK_FILE: string = "deno.lock";
const DEFAULT_SEVERITY: Severity = "high";
const DEFAULT_IGNORE: string[] = [];
const DEFAULT_VERBOSITY: boolean = false;
const DEFAULT_SILENCE: boolean = false;
const DEFAULT_OUTPUT_DIR: string = `${Deno.cwd()}/.audit`;
const DEFAULT_GITHUB_TOKEN: string | undefined = Deno.env.get("GITHUB_TOKEN");

/** Options for the {@link audit} function. */
export type AuditOptions = {
  /** Path to the Deno lock file (default: `deno.lock`) */
  lock?: string;
  /** Minimum severity of an advisory vulnerability, only affects the return code (default: `high`) */
  severity?: Severity;
  /** Comma separated list of packages to ignore (default: `[]`) */
  ignore?: string[] | readonly [];
  /** Print additional output (default: `false`) */
  verbose?: boolean;
  /** Disable output (default: `false`) */
  silent?: boolean;
  /** Output directory (default: `.audit`) */
  outputDir?: string;
  /** Token for authenticated GitHub API requests (default: `undefined`) */
  githubToken?: string;
};

/**
 * Audit JSR, NPM, and ESM packages.
 *
 * @param {AuditOptions} options Audit options
 * @returns {Promise<number>} An exit code indicating if vulnerabilities have been found (`1`) or not (`0`).
 */
export const audit = async (options?: AuditOptions): Promise<number> => {
  const {
    lock = DEFAULT_LOCK_FILE,
    severity = DEFAULT_SEVERITY,
    ignore = DEFAULT_IGNORE,
    verbose = DEFAULT_VERBOSITY,
    silent = DEFAULT_SILENCE,
    outputDir = DEFAULT_OUTPUT_DIR,
    githubToken = DEFAULT_GITHUB_TOKEN,
  }: AuditOptions = options ?? {};

  try {
    Deno.removeSync(outputDir, { recursive: true });
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  Deno.mkdirSync(outputDir);

  File.writeReport(outputDir, "# Audit report\n");

  if (!silent) {
    console.info(`Using lock file: %c${lock}\n`, "font-weight: bold");
  }

  const { jsr, npm, esm, denoland } = extractPackages(lock, {
    ignore,
    verbose,
    silent,
  });

  const jsrAuditCode = await auditJsr(jsr, {
    severity,
    silent,
    outputDir,
    githubToken,
  });
  const denolandAuditCode = await auditDenoland(denoland, {
    severity,
    silent,
    outputDir,
    githubToken,
  });
  const npmAuditCode = await auditNpm([...npm, ...esm], {
    severity,
    silent,
    outputDir,
  });

  File.generateHtmlReport(outputDir);

  return jsrAuditCode || denolandAuditCode || npmAuditCode;
};

/**
 * Audit JSR, NPM, and ESM packages with CLI options (powered by [Cliffy](https://cliffy.io/)).
 */
export const runAudit = async (args = Deno.args): Promise<void> => {
  await new Command()
    .name("audit")
    .description(
      "A tool for auditing JSR, NPM, and ESM packages utilizing the GitHub Advisory Database and npm audit.",
    )
    .version(denoJson.version)
    .type("severity", new EnumType(severities))
    .env(
      "GITHUB_TOKEN=<token:string>",
      "Token for authenticated GitHub API requests.",
    )
    .group("Audit options")
    .option("-l, --lock <lock-file:file>", "Deno lock file (v4) to audit.", {
      default: DEFAULT_LOCK_FILE,
    })
    .option(
      "-s, --severity <severity:severity>",
      "Minimum severity (only affects the return code).",
      {
        default: DEFAULT_SEVERITY,
      },
    )
    .option(
      "-i, --ignore <packages:string[]>",
      "Comma separated list of packages to ignore.",
      {
        default: DEFAULT_IGNORE,
      },
    )
    .group("Output options")
    .option("-v, --verbose", "Verbose console output.", {
      default: DEFAULT_VERBOSITY,
    })
    .option("--silent", "Mute console output.", {
      default: DEFAULT_SILENCE,
    })
    .option("-o, --output-dir <output-dir:file>", "Output directory.", {
      default: DEFAULT_OUTPUT_DIR,
    })
    .action(
      async (
        { lock, severity, ignore, verbose, silent, outputDir, githubToken },
      ) => {
        const code = await audit({
          lock,
          severity,
          ignore,
          verbose,
          silent,
          outputDir,
          githubToken,
        });
        Deno.exit(code);
      },
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
            port: 0,
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
        if (!(err instanceof Deno.errors.NotFound)) throw err;
        console.info(`No audit report found at ${outputDir}/report.html`);
      }
    })
    .parse(args);
};
