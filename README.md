# audit

[![JSR](https://jsr.io/badges/@nashaddams/audit)](https://jsr.io/@nashaddams/audit)
[![main](https://github.com/nashaddams/audit/actions/workflows/tests.yml/badge.svg)](https://github.com/nashaddams/audit/actions)

A tool for auditing [JSR](https://jsr.io/), [NPM](https://www.npmjs.com/), and
[ESM](https://esm.sh/) packages with [Deno](https://deno.com/) utilizing the
[GitHub Advisory Database](https://github.com/advisories) and
[`npm audit`](https://docs.npmjs.com/cli/commands/npm-audit).

The packages are extracted from a given `deno.lock` (v4) file.

## JSR packages

For JSR packages, `audit` tries to infer the corresponding GitHub repository
(_api.jsr.io_) from where it can gather published vulnerabilities
(_api.github.io_).

## NPM/ESM packages

NPM and ESM packages are injected into a generated `package.json` file on which
`npm audit` is executed.

## Usage

### Via `deno run` (recommended)

```sh
deno run https://jsr.io/@nashaddams/audit/<version>/mod.ts --help # Print options

deno run \
  -RWE -N=api.jsr.io,api.github.com --allow-run=npm \
  https://jsr.io/@nashaddams/audit/<version>/mod.ts
```

Running this command will print the audit results to the console, create a
report in the output directory, and return an exit code indicating if
vulnerabilities have been found (`1`) or not (`0`).

### Via `import`

Alternatively, `audit` can also be imported and used as a library function:

```ts
import { audit, runAudit } from "@nashaddams/audit";

audit(options?: AuditOptions);
runAudit(); // CLI wrapper for `audit`
```

See [the docs](https://jsr.io/@nashaddams/audit/doc) for further details.

### Ignoring packages

Packages can be excluded from the audit by passing the package names to the
`-i, --ignore` flag (comma separated list), or by adding them to an
`.auditignore` file (one package name per row).

### HTML report

The `report` subcommand serves the generated audit report:

```sh
deno run \
  -RE -N=0.0.0.0 \
  https://jsr.io/@nashaddams/audit/<version>/mod.ts \
  report
```
