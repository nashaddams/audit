import { assertEquals } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../../mod.ts";
import { Api } from "../../src/api.ts";
import { amqpAdvisories, honoAdvisories } from "./jsr.test.ts";
import { postgresAdvisories } from "./denoland.test.ts";
import { axiosAdvisories } from "./npm.test.ts";
import { echartsAdvisories } from "./esm.test.ts";

describe("[audit] mixed", () => {
  afterEach(() => {
    Deno.removeSync(".audit", { recursive: true });
  });

  it("should audit mixed packages", async (t) => {
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
        if (repo === "hono") {
          return await Promise.resolve(honoAdvisories);
        } else if (repo === "amqp") {
          return await Promise.resolve(amqpAdvisories);
        } else if (repo === "postgres") {
          return await Promise.resolve(postgresAdvisories);
        } else if (repo === "axios") {
          return await Promise.resolve(axiosAdvisories);
        } else if (repo === "echarts") {
          return await Promise.resolve(echartsAdvisories);
        } else {
          return await Promise.resolve([]);
        }
      },
    );

    const code = await audit({
      lockFile: "test/audit/examples/mixed/deno.lock",
    });
    assertEquals(code, 1);

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "mixed",
      path: `${import.meta.dirname}/__snapshots__/mixed.snap`,
    });
  });
});
