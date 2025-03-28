import { assertEquals } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../../../mod.ts";
import { File } from "../../../src/file.ts";
import { Stub } from "../../utils/stubs.ts";

describe("[audit] bun-lock", () => {
  afterEach(() => {
    File.clearOutputDir();
  });

  it("should audit NPM and JSR packages", async (t) => {
    using _ = Stub.fetchNpmPkg;
    using __ = Stub.fetchJsrPkg;
    using ___ = Stub.fetchGithubAdvisories;

    const code = await audit({
      lockFile: "test/audit/bun-lock/bun.lock",
      resolver: "bun-lock",
    });
    assertEquals(code, 1);

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "bun-lock",
      path: `${import.meta.dirname}/__snapshots__/bun-lock.snap`,
    });
  });
});
