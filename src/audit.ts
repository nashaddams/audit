import { Command, EnumType } from "@cliffy/command";
import denoJson from "../deno.json" with { type: "json" };
import { severities, type Severity } from "./types.ts";
import { extractPackages } from "./extract.ts";
import { auditJsr } from "./audit-jsr.ts";
import { auditNpm } from "./audit-npm.ts";

const DEFAULT_LOCK_FILE: string = "deno.lock";
const DEFAULT_SEVERITY: Severity = "high";
const DEFAULT_VERBOSITY: boolean = false;
const DEFAULT_SILENCE: boolean = false;
const DEFAULT_OUTPUT_DIR: string = `${Deno.cwd()}/.audit`;

/** Options for the {@link audit} function. */
export type AuditOptions = {
  /** Path to the Deno lock file (default: `deno.lock`) */
  lock?: string;
  /** Minimum severity of an advisory vulnerability, only affects the return code (default: `high`) */
  severity?: Severity;
  /** Print additional output (default: `false`) */
  verbose?: boolean;
  /** Disable output (default: `false`) */
  silent?: boolean;
  /** Output directory (default: `.audit`) */
  outputDir?: string;
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
    verbose = DEFAULT_VERBOSITY,
    silent = DEFAULT_SILENCE,
    outputDir = DEFAULT_OUTPUT_DIR,
  } = options ?? {};

  try {
    Deno.removeSync(outputDir, { recursive: true });
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  Deno.mkdirSync(outputDir);

  if (!silent) {
    console.info(`Using lock file: %c${lock}\n`, "font-weight: bold");
  }

  const { jsr, npm, esm } = extractPackages(lock, {
    verbose,
    silent,
  });

  const jsrAuditCode = await auditJsr(jsr, { severity, silent, outputDir });
  const npmAuditCode = await auditNpm([...npm, ...esm], {
    severity,
    silent,
    outputDir,
  });

  return jsrAuditCode || npmAuditCode;
};

/**
 * Audit JSR, NPM, and ESM packages with CLI options (powered by [Cliffy](https://cliffy.io/)).
 */
export const runAudit = async (): Promise<void> => {
  await new Command()
    .name("audit")
    .description("A basic Deno audit tool for JSR, NPM, and ESM packages.")
    .version(denoJson.version)
    .type("severity", new EnumType(severities))
    .option("-l, --lock <lock:file>", "The Deno lock file to audit.", {
      default: DEFAULT_LOCK_FILE,
    })
    .option(
      "-s, --severity <name:severity>",
      "The minimum severity of an advisory vulnerability (only affects the return code)",
      { default: DEFAULT_SEVERITY },
    )
    .option("-v, --verbose", "Verbose output.", { default: DEFAULT_VERBOSITY })
    .option("--silent", "Mute output.", { default: DEFAULT_SILENCE })
    .option("-o, --output-dir <output-dir:file>", "Output directory", {
      default: DEFAULT_OUTPUT_DIR,
    })
    .action(async ({ lock, severity, verbose, silent, outputDir }) => {
      const code = await audit({ lock, severity, verbose, silent, outputDir });
      Deno.exit(code);
    })
    .parse();
};
