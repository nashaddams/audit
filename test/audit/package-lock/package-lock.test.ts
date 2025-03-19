import { assertEquals } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../../../mod.ts";
import { Stub } from "../../utils/stubs.ts";

describe("[audit] package-lock", () => {
  afterEach(() => {
    Deno.removeSync(".audit", { recursive: true });
  });

  it("should audit NPM and JSR packages", async (t) => {
    using _ = Stub.fetchNpmPkg;
    using __ = Stub.fetchJsrPkg;
    using ___ = Stub.fetchGithubAdvisories;

    const code = await audit({
      lockFile: "test/audit/package-lock/package-lock.json",
      resolver: "package-lock",
    });
    assertEquals(code, 1);

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "package-lock",
      path: `${import.meta.dirname}/__snapshots__/package-lock.snap`,
    });
  });
});
