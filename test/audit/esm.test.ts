import { afterEach, describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../../mod.ts";
import { Api } from "../../src/api.ts";
import { createAdvisory, createVulnerability } from "../utils.ts";

export const echartsAdvisories = [
  createAdvisory({
    vulnerabilities: [
      createVulnerability({
        package: {
          ecosystem: "npm",
          name: "echarts",
        },
        vulnerable_version_range: "5.5.1",
      }),
    ],
  }),
];

describe("[audit] ESM", () => {
  afterEach(() => {
    Deno.removeSync(".audit", { recursive: true });
  });

  it("should audit ESM packages", async (t) => {
    // deno-lint-ignore no-unused-vars
    using fetchEsmPkgStub = stub(
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
        if (repo === "echarts") {
          return await Promise.resolve(echartsAdvisories);
        } else {
          return await Promise.resolve([]);
        }
      },
    );

    await audit({ lock: "test/audit/examples/esm/deno.lock" });

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "ESM",
      path: `${import.meta.dirname}/__snapshots__/esm.snap`,
    });
  });
});
