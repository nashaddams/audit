import { Command, EnumType } from "@cliffy/command";
import denoJson from "../deno.json" with { type: "json" };
import { extractPackages } from "./extract.ts";
import { auditJsr } from "./audit-jsr.ts";
import { auditNpm } from "./audit-npm.ts";
import { severities, type Severity } from "./types.ts";
import { createOutDir } from "./util.ts";

const DEFAULT_LOCK_FILE: string = "deno.lock";
const DEFAULT_SEVERITY: Severity = "high";
const DEFAULT_VERBOSITY: boolean = false;
const DEFAULT_SILENCE: boolean = false;

export const audit = async (options?: {
  lock?: string;
  severity?: Severity;
  verbose?: boolean;
  silent?: boolean;
}): Promise<number> => {
  const {
    lock = DEFAULT_LOCK_FILE,
    severity = DEFAULT_SEVERITY,
    verbose = DEFAULT_VERBOSITY,
    silent = DEFAULT_SILENCE,
  } = options ?? {};

  createOutDir();

  if (!silent) {
    console.info(`Using lock file: %c${lock}\n`, "font-weight: bold");
  }

  const { jsr, npm, esm } = extractPackages(lock, {
    verbose,
    silent,
  });

  const jsrAuditCode = await auditJsr(jsr, { severity, silent });
  const npmAuditCode = await auditNpm([...npm, ...esm], { severity, silent });

  return jsrAuditCode || npmAuditCode;
};

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
    .action(async ({ lock, severity, verbose, silent }) => {
      const code = await audit({ lock, severity, verbose, silent });
      Deno.exit(code);
    })
    .parse();
};
