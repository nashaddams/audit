# audit

[![JSR](https://jsr.io/badges/@nashaddams/audit)](https://jsr.io/@nashaddams/audit)
[![JSR score](https://jsr.io/badges/@nashaddams/audit/score)](https://jsr.io/@nashaddams/audit)
[![main](https://github.com/nashaddams/audit/actions/workflows/tests.yml/badge.svg)](https://github.com/nashaddams/audit/actions)

A tool for auditing [JSR](https://jsr.io), [deno.land](https://deno.land/x),
[NPM](https://www.npmjs.com), and [ESM](https://esm.sh) packages with
[Deno](https://deno.com) utilizing the
[GitHub Advisory Database](https://github.com/advisories).

## Workflow

- Extract the packages from a given `deno.lock` (v4) file
- Resolve the corresponding GitHub repositories
  - JSR via `api.jsr.io`
  - deno.land via `cdn.deno.land`
  - NPM & ESM via `registry.npmjs.org`
- Fetch published vulnerabilities via `api.github.io`
- Create a report

## Usage

### Via `deno run`

```sh
deno run -A jsr:@nashaddams/audit [--help]
```

Running this command will print the audit results to the console, create a
report in the output directory, and return an exit code indicating if
vulnerabilities have been found and matched (`1`) or not (`0`).

### Via `import`

Alternatively, `audit` can also be imported and used as a library function:

```ts
import { audit, runAudit } from "@nashaddams/audit";

audit(options?: AuditOptions);
runAudit(); // CLI wrapper for `audit`
```

See [the docs](https://jsr.io/@nashaddams/audit/doc) for further details.

### HTML report

The `report` subcommand serves the generated audit report:

```sh
deno run -A jsr:@nashaddams/audit report
```

### Ignoring vulnerabilities

Vulnerabilities for a specific package can be excluded by adding the package
name and CVE ID(s) or GHSA ID(s) to the `audit.json` configuration file:

```json
{
  "ignore": {
    "@std/bytes": ["CVE-2024-12345"],
    "@std/cli": ["GHSA-1234-fwm1-12wm"]
  }
}
```

### Granular `run` permissions

For convenience, the previous `run` instructions use the `-A` permission flag
which grants all permissions to `audit`. Alternatively, granular flags can be
passed instead:

| Command        | Permissions                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `audit`        | `-RW=.`<br/>`-E=GITHUB_TOKEN,NO_COLOR,FORCE_COLOR,TERM`<br/>`-N=api.jsr.io,cdn.deno.land,registry.npmjs.org,api.github.com` |
| `audit report` | `-R=.`<br/>`-E=GITHUB_TOKEN,NO_COLOR,FORCE_COLOR,TERM`<br/>`-N=0.0.0.0`                                                     |
| `audit --help` | `-R=.`<br/>`-E=GITHUB_TOKEN,NO_COLOR,FORCE_COLOR,TERM`                                                                      |

<details>

<summary>Details</summary>

| Permission                                                      | Usage                                                                |
| --------------------------------------------------------------- | -------------------------------------------------------------------- |
| `-R=.`                                                          | Read the lock file and the report.                                   |
| `-W=.`                                                          | Write the report.                                                    |
| `-E=GITHUB_TOKEN,NO_COLOR,FORCE_COLOR,TERM`                     | Used for authenticated GitHub API requests and the terminal spinner. |
| `-N=api.jsr.io,cdn.deno.land,registry.npmjs.org,api.github.com` | Fetch the package informations, and GitHub security advisories.      |
| `-N=0.0.0.0`                                                    | Serve the generated audit report.                                    |

</details>
