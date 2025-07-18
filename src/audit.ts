import { Command, EnumType } from "@cliffy/command";
import { intersect } from "@std/collections/intersect";
import { bold, green } from "@std/fmt/colors";
import denoJson from "../deno.json" with { type: "json" };
import { type ResolverName, resolvers } from "./resolver/mod.ts";
import { inferSeverities, severities, type Severity } from "./severity.ts";
import type { PkgResolved } from "./types.ts";
import { Env } from "./env.ts";
import { File } from "./file.ts";
import { Report } from "./report.ts";
import { resolve } from "./resolve.ts";
import { match } from "./match.ts";
import { fetchLicenses } from "./license.ts";

const DEFAULT_LOCK_FILE: string = `${Deno.cwd()}/deno.lock`;
const DEFAULT_SEVERITY: Severity = "medium";
const DEFAULT_RESOLVER: ResolverName = "deno-lock";
const DEFAULT_RESOLVE_ONLY: boolean = false;

/** Options for the {@link audit} function. */
export type AuditOptions = {
  /** Path to the lock file (default: `deno.lock`). */
  lockFile?: string;
  /** Minimum severity of an advisory vulnerability, only affects the return code (default: `medium`). */
  severity?: Severity;
  /** Resolver to use: `deno-lock`, `package-lock`, `bun-lock` (default: `deno-lock`) */
  resolver?: ResolverName;
  /** Only resolve lock file packages, don't audit them. */
  resolveOnly?: boolean;
};

/**
 * Audit JSR, deno.land, NPM, and ESM packages.
 *
 * @param {AuditOptions} options Audit options.
 * @returns {Promise<number>} An exit code indicating if vulnerabilities have been found and matched (`1`) or not (`0`).
 */
export const audit = async (options?: AuditOptions): Promise<number> => {
  const {
    lockFile = DEFAULT_LOCK_FILE,
    severity = DEFAULT_SEVERITY,
    resolver = DEFAULT_RESOLVER,
    resolveOnly = DEFAULT_RESOLVE_ONLY,
  }: AuditOptions = options ?? {};

  File.clearOutputDir();
  File.createOutputDir();

  const resolved = await resolve(lockFile, resolver);
  File.writeResolvedPackages(resolved);
  const resolvedWithAdvisories = resolved.filter((pkg) =>
    pkg.advisories?.length
  );

  if (resolveOnly) {
    return 0;
  }

  const matched = match(resolvedWithAdvisories);
  const { ignore = {} } = File.readConfig();

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

  if (pkgs.length > 0) {
    const reportString = Report.createGithubAdvisoriesReport({ pkgs });

    console.info("\n# Audit report\n");
    console.info(reportString);
    File.writeReport("# Audit report\n\n");
    File.writeReport(reportString);
    File.writeHtmlReport();

    const severitiesToInclude = inferSeverities(severity);
    const severities = pkgs.flatMap(({ advisories }) =>
      advisories?.map((advisory) => advisory.severity)
    );

    if (intersect(severitiesToInclude, severities).length > 0) {
      return 1;
    }
  } else {
    console.info("\nNo vulnerabilities found or matched.\n");
  }

  return 0;
};

/**
 * Audit JSR, deno.land, NPM, and ESM packages with CLI options (powered by [Cliffy](https://cliffy.io/)).
 */
export const runAudit = async (args: string[] = Deno.args): Promise<void> => {
  await new Command()
    .name("audit")
    .description(
      "Audit JSR, deno.land, NPM, and ESM packages utilizing the GitHub Advisory Database.",
    )
    .version(denoJson.version)
    .versionOption(
      "-v, --version",
      "Print version.",
      function (this: Command) {
        console.info(this.getVersion());
      },
    )
    .type("severity", new EnumType(severities))
    .type("resolver", new EnumType(resolvers))
    .globalEnv(
      "OUTPUT_DIR=<output-dir:string>",
      `Output directory.\t(${bold("Default:")} ${
        green(`"${Env.OUTPUT_DIR}"`)
      })`,
    )
    .globalEnv(
      "CONFIG_FILE=<config-file:string>",
      `Configuration file.\t(${bold("Default:")} ${
        green(`"${Env.CONFIG_FILE}"`)
      })`,
    )
    .globalEnv(
      "GITHUB_TOKEN=<token:string>",
      "Token for authenticated GitHub API requests.",
    )
    .option(
      "-l, --lock-file <lock-file:file>",
      "Lock file to audit (Deno v4, NPM v3, Bun v1).",
      {
        default: DEFAULT_LOCK_FILE,
      },
    )
    .option(
      "-s, --severity <severity:severity>",
      "Minimum severity, only affects the return code.",
      {
        default: DEFAULT_SEVERITY,
      },
    )
    .option(
      "-r, --resolver <resolver:resolver>",
      "Resolver used to parse the lock file.",
      {
        default: DEFAULT_RESOLVER,
      },
    )
    .option(
      "--resolve-only",
      "Only resolve lock file packages, don't audit them.",
      {
        default: false,
      },
    )
    .action(async ({ lockFile, severity, resolver, resolveOnly }) => {
      const code = await audit({ lockFile, severity, resolver, resolveOnly });
      Deno.exit(code);
    })
    .example(
      "audit.json",
      '{\n  "ignore": {\n    "@std/bytes": ["CVE-2024-12345"],\n    "@std/cli": ["GHSA-1234-fwm1-12wm"]\n  }\n}',
    )
    .command("report", "Serve the generated audit report.")
    .action(() => {
      const htmlReport = File.readHtmlReport();

      if (htmlReport !== null) {
        Deno.serve(
          {
            port: 4711,
            onListen: (({ port, hostname }) => {
              console.info(
                `Serving audit report at http://${hostname}:${port}`,
              );
            }),
          },
          () => new Response(htmlReport),
        );
      }
    })
    .command("licenses", "Fetch the licenses for resolved packages.")
    .option(
      "-m, --merge [merge:boolean]",
      "Merge the licenses into a single file.",
      {
        default: false,
      },
    )
    .action(async ({ merge }) => {
      const resolvedPkgs = File.readResolvedPackages();

      if (resolvedPkgs !== null) {
        await fetchLicenses(resolvedPkgs, { merge });
      }
    })
    .parse(args);
};
