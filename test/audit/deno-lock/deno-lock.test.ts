import { assertEquals } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../../../mod.ts";
import { Stub } from "../../utils/stubs.ts";

describe("[audit] deno-lock", () => {
  afterEach(() => {
    Deno.removeSync(".audit", { recursive: true });
  });

  it("should audit mixed packages", async (t) => {
    using _ = Stub.fetchJsrPkg;
    using __ = Stub.fetchDenolandPkg;
    using ___ = Stub.fetchNpmPkg;
    using ____ = Stub.fetchGithubAdvisories;

    const code = await audit({
      lockFile: "test/audit/deno-lock/deno.lock",
    });
    assertEquals(code, 1);

    await assertSnapshot(t, Deno.readTextFileSync(".audit/report.md"), {
      name: "deno-lock",
      path: `${import.meta.dirname}/__snapshots__/deno-lock.snap`,
    });
  });
});
