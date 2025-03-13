import { afterEach, describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../../mod.ts";
import { Api } from "../../src/api.ts";
import { createAdvisory, createVulnerability } from "../utils.ts";

export const postgresAdvisories = [
  createAdvisory({
    vulnerabilities: [
      createVulnerability({
        package: {
          ecosystem: "other",
          name: "postgres",
        },
        vulnerable_version_range: "0.19.3",
      }),
    ],
  }),
];

describe("[audit] deno.land", () => {
  afterEach(() => {
    Deno.removeSync(".audit", { recursive: true });
  });

  it("should audit deno.land packages", async (t) => {
    // deno-lint-ignore no-unused-vars
    using fetchDenolandPkgStub = stub(
      Api,
      "fetchDenolandPkg",
      async ({ pkg, version }) => {
        return await Promise.resolve({
          upload_options: {
            type: "github",
            repository: `some/${pkg}`,
            ref: version,
          },
        });
      },
    );

    // deno-lint-ignore no-unused-vars
    using fetchGithubAdvisoriesStub = stub(
      Api,
      "fetchGithubAdvisories",
      async ({ repo }) => {
        if (repo === "postgres") {
          return await Promise.resolve(postgresAdvisories);
        } else {
          return await Promise.resolve([]);
        }
      },
    );

    await audit({ lock: "test/audit/examples/denoland/deno.lock" });

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "deno.land",
      path: `${import.meta.dirname}/__snapshots__/denoland.snap`,
    });
  });
});
