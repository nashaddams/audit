import { assertEquals } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../../mod.ts";
import { Api } from "../../src/api.ts";
import { createAdvisory, createVulnerability } from "../utils.ts";

export const axiosAdvisories = [
  createAdvisory({
    vulnerabilities: [
      createVulnerability({
        package: {
          ecosystem: "npm",
          name: "axios",
        },
        vulnerable_version_range: ">=1.8.3",
      }),
    ],
  }),
];

describe("[audit] bun-lock", () => {
  afterEach(() => {
    Deno.removeSync(".audit", { recursive: true });
  });

  it("should audit NPM packages", async (t) => {
    // deno-lint-ignore no-unused-vars
    using fetchNpmPkgStub = stub(
      Api,
      "fetchNpmPkg",
      async ({ pkg }) => {
        return await Promise.resolve({
          repository: {
            url: `git+https://github.com/some/${pkg}.git`,
          },
        });
      },
    );

    // deno-lint-ignore no-unused-vars
    using fetchGithubAdvisoriesStub = stub(
      Api,
      "fetchGithubAdvisories",
      async ({ repo }) => {
        if (repo === "axios") {
          return await Promise.resolve(axiosAdvisories);
        } else {
          return await Promise.resolve([]);
        }
      },
    );

    const code = await audit({
      lockFile: "test/audit/examples/bun-lock/bun.lock",
      resolver: "bun-lock",
    });
    assertEquals(code, 1);

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "bun-lock",
      path: `${import.meta.dirname}/__snapshots__/bun-lock.snap`,
    });
  });
});
