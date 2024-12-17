# audit

A tool for auditing [JSR](https://jsr.io/), [NPM](https://www.npmjs.com/), and
[ESM](https://esm.sh/) packages with [Deno](https://deno.com/) utilizing the
[GitHub Advisory Database](https://github.com/advisories) and
[`npm audit`](https://docs.npmjs.com/cli/commands/npm-audit).

The packages are extracted from a given `deno.lock` file.

## JSR packages

For JSR packages, `audit` tries to infer the corresponding GitHub repository
(_api.jsr.io_) from where it can gather published vulnerabilities
(_api.github.io_).

## NPM/ESM packages

NPM and ESM packages are injected into a generated `package.json` file on which
`npm audit` is executed.

## Usage

```sh
deno run https://jsr.io/@nashaddams/audit/<version>/mod.ts --help # Print options

deno run -RW -N=api.jsr.io,api.github.com --allow-run=npm https://jsr.io/@nashaddams/audit/<version>/mod.ts
```
