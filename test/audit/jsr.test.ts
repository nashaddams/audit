import { assertEquals } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../../mod.ts";
import { Api } from "../../src/api.ts";
import { createAdvisory, createVulnerability } from "../utils.ts";

export const honoAdvisories = [
  createAdvisory({
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
  createAdvisory({
    vulnerabilities: [
      createVulnerability({
        package: {
          ecosystem: "other",
          name: "http", // Sub-package
        },
        vulnerable_version_range: "10.0.4",
      }),
    ],
  }),
];

export const amqpAdvisories = [
  createAdvisory({
    vulnerabilities: [
      createVulnerability({
        package: {
          ecosystem: "other",
          name: "amqp",
        },
        vulnerable_version_range: "1.0.0",
      }),
    ],
  }),
];

describe("[audit] JSR", () => {
  afterEach(() => {
    Deno.removeSync(".audit", { recursive: true });
  });

  it("should audit JSR packages", async (t) => {
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
        } else if (repo === "amqp") {
          return await Promise.resolve(amqpAdvisories);
        } else {
          return await Promise.resolve([]);
        }
      },
    );

    const code = await audit({ lockFile: "test/audit/examples/jsr/deno.lock" });
    assertEquals(code, 1);

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "JSR",
      path: `${import.meta.dirname}/__snapshots__/jsr.snap`,
    });
  });
});
