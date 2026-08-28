import { assertEquals } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../../mod.ts";
import { Api } from "../../src/api.ts";
import { File } from "../../src/file.ts";
import { createAdvisory, createVulnerability } from "../utils.ts";

export const honoAdvisories = [
  createAdvisory({
    ghsa_id: "GSHA-4711",
    vulnerabilities: [
      createVulnerability({
        package: {
          ecosystem: "other",
          name: "hono",
        },
        vulnerable_version_range: "4.6.4",
      }),
    ],
  }),
];

describe("[audit] ignore", () => {
  afterEach(() => {
    Deno.removeSync(".audit", { recursive: true });
  });

  it("should ignore packages", async (t) => {
    // deno-lint-ignore no-unused-vars
    using fetchJsrPkgStub = stub(
      Api,
      "fetchJsrPkg",
      async ({ scope, pkg }) => {
        return await Promise.resolve({
          githubRepository: { owner: scope, name: pkg },
        });
      },
    );

    // deno-lint-ignore no-unused-vars
    using fetchGithubAdvisoriesStub = stub(
      Api,
      "fetchGithubAdvisories",
      async ({ repo }) => {
        if (repo === "hono") {
          return await Promise.resolve(honoAdvisories);
        } else {
          return await Promise.resolve([]);
        }
      },
    );

    // deno-lint-ignore no-unused-vars
    using readConfigStub = stub(
      File,
      "readConfig",
      () => {
        return {
          ignore: {
            "@hono/hono": ["GSHA-4711"],
          },
        };
      },
    );

    const code = await audit({ lock: "test/audit/examples/jsr/deno.lock" });
    assertEquals(code, 0);

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "ignore",
      path: `${import.meta.dirname}/__snapshots__/ignore.snap`,
    });
  });
});
