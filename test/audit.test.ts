import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { type Stub, stub } from "@std/testing/mock";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../mod.ts";
import { Api } from "../src/api.ts";
import type { GithubAdvisories } from "../src/types.ts";
import jsrAdvisories from "./examples/jsr-only/advisories.json" with {
  type: "json",
};
import npmAdvisories from "./examples/npm-only/advisories.json" with {
  type: "json",
};
import esmAdvisories from "./examples/esm-only/advisories.json" with {
  type: "json",
};
import allAdvisories from "./examples/all/advisories.json" with {
  type: "json",
};

describe("audit", () => {
  let fetchJsrPkgStub: Stub | undefined = undefined;
  let fetchDenolandPkgStub: Stub | undefined = undefined;
  let fetchNpmPkgStub: Stub | undefined = undefined;
  let fetchGithubAdvisoriesStub: Stub | undefined = undefined;

  beforeEach(() => {
    fetchJsrPkgStub = stub(
      Api,
      "fetchJsrPkg",
      async () =>
        await Promise.resolve({
          githubRepository: {
            owner: "nashaddams",
            name: "audit",
          },
        }),
    );
    fetchDenolandPkgStub = stub(
      Api,
      "fetchDenolandPkg",
      async () =>
        await Promise.resolve({
          upload_options: {
            type: "github",
            repository: "denoland/deno_std",
            ref: "0.214.0",
          },
        }),
    );
    fetchNpmPkgStub = stub(
      Api,
      "fetchNpmPkg",
      async () =>
        await Promise.resolve({
          repository: {
            url: "git+https://github.com/axios/axios.git",
          },
        }),
    );
  });

  afterEach(() => {
    if (fetchJsrPkgStub && !fetchJsrPkgStub.restored) {
      fetchJsrPkgStub.restore();
    }
    if (fetchDenolandPkgStub && !fetchDenolandPkgStub.restored) {
      fetchDenolandPkgStub.restore();
    }
    if (fetchNpmPkgStub && !fetchNpmPkgStub.restored) {
      fetchNpmPkgStub.restore();
    }
    if (fetchGithubAdvisoriesStub && !fetchGithubAdvisoriesStub.restored) {
      fetchGithubAdvisoriesStub.restore();
    }
    Deno.removeSync(".audit", { recursive: true });
  });

  it("should audit JSR packages", async (t) => {
    fetchGithubAdvisoriesStub = stub(
      Api,
      "fetchGithubAdvisories",
      async () => await Promise.resolve(jsrAdvisories as GithubAdvisories),
    );

    await audit({
      lock: "test/examples/jsr-only/deno.lock",
      severity: "low",
    });

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "JSR only",
      path: `${import.meta.dirname}/__snapshots__/jsr-only.snap`,
    });
  });

  it("should audit NPM packages", async (t) => {
    fetchGithubAdvisoriesStub = stub(
      Api,
      "fetchGithubAdvisories",
      async () => await Promise.resolve(npmAdvisories as GithubAdvisories),
    );

    await audit({
      lock: "test/examples/npm-only/deno.lock",
      severity: "low",
    });

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "NPM only",
      path: `${import.meta.dirname}/__snapshots__/npm-only.snap`,
    });
  });

  it("should audit ESM packages", async (t) => {
    fetchGithubAdvisoriesStub = stub(
      Api,
      "fetchGithubAdvisories",
      async () => await Promise.resolve(esmAdvisories as GithubAdvisories),
    );

    await audit({
      lock: "test/examples/esm-only/deno.lock",
      severity: "low",
    });

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "ESM only",
      path: `${import.meta.dirname}/__snapshots__/esm-only.snap`,
    });
  });

  it("should audit all packages", async (t) => {
    fetchGithubAdvisoriesStub = stub(
      Api,
      "fetchGithubAdvisories",
      async () => await Promise.resolve(allAdvisories as GithubAdvisories),
    );

    await audit({
      lock: "test/examples/all/deno.lock",
      severity: "low",
    });

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "All",
      path: `${import.meta.dirname}/__snapshots__/all.snap`,
    });
  });
});
