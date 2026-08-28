# audit

[![JSR](https://jsr.io/badges/@nashaddams/audit)](https://jsr.io/@nashaddams/audit)
[![JSR score](https://jsr.io/badges/@nashaddams/audit/score)](https://jsr.io/@nashaddams/audit)
[![main](https://github.com/nashaddams/audit/actions/workflows/tests.yml/badge.svg)](https://github.com/nashaddams/audit/actions)

Audit [JSR](https://jsr.io), [deno.land](https://deno.land/x),
[NPM](https://www.npmjs.com), and [ESM](https://esm.sh) packages utilizing the
[GitHub Advisory Database](https://github.com/advisories).

## Usage

```sh
deno run -A jsr:@nashaddams/audit [--help]
```

Running this command will print the audit results, create a report in the output
directory (`.md`, `.html`), and return an exit code indicating whether
vulnerabilities have been found and matched (`1`) or not (`0`).

> [!TIP]
> Avoid exceeding GitHub rate limits by
> [creating an access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
> and passing it via `GITHUB_TOKEN` environment variable.

### Serving the report

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

### Library usage

Alternatively, `audit` can also be imported and used as a library function:

```ts
import { audit } from "@nashaddams/audit";

audit(options?: AuditOptions);
```

See [the docs](https://jsr.io/@nashaddams/audit/doc) for further details.

### Collecting licenses

In addition to auditing packages, `audit` can also collect the licenses of
resolved packages via `licenses` subcommand:

```sh
deno run -A jsr:@nashaddams/audit licenses [--merge]
```

## Workflow

- Extract the packages from a given lock file
- Resolve the corresponding GitHub repositories
  - JSR via `api.jsr.io`
  - deno.land via `cdn.deno.land`
  - NPM & ESM via `registry.npmjs.org`
- Fetch published vulnerabilities via `api.github.io`
- Create a report

## Granular `run` permissions

For convenience, the previous `run` instructions use the `-A` permission flag
which grants all permissions to `audit`. Alternatively, granular flags can be
passed instead:

| Command          | Permissions                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `audit`          | `-RW=.`<br/>`-E=OUTPUT_DIR,CONFIG_FILE,GITHUB_TOKEN,TERM`<br/>`-N=api.jsr.io,cdn.deno.land,registry.npmjs.org,api.github.com` |
| `audit report`   | `-R=.`<br/>`-E=OUTPUT_DIR,CONFIG_FILE,GITHUB_TOKEN,TERM`<br/>`-N=0.0.0.0`                                                     |
| `audit licenses` | `-RW.`<br/>`-E=OUTPUT_DIR,CONFIG_FILE,GITHUB_TOKEN,TERM`<br/>`-N=api.github.com`                                              |

<details>

<summary>Details</summary>

| Permission | Usage                                                                                               |
| ---------- | --------------------------------------------------------------------------------------------------- |
| `-R`       | Read the lock file, audit report, and resolved packages.                                            |
| `-W`       | Write the audit report, resolved and unresolved packages, and licenses.                             |
| `-E`       | Configue `audit`, make authenticated GitHub API requests, and the terminal spinner.                 |
| `-N`       | Fetch the package information and GitHub security advisories, and serve the generated audit report. |

</details>
