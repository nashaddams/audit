import { assertEquals, assertThrows } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { audit } from "../mod.ts";
import { File } from "../src/file.ts";
import { Stub } from "./utils/stubs.ts";

describe("[audit] config", () => {
  afterEach(() => {
    Deno.removeSync(".audit", { recursive: true });
  });

  it("should ignore packages", async () => {
    using _ = Stub.fetchJsrPkg;
    using __ = Stub.fetchDenolandPkg;
    using ___ = Stub.fetchNpmPkg;
    using ____ = Stub.fetchGithubAdvisories;

    using _____ = stub(
      File,
      "readConfig",
      () => {
        return {
          ignore: {
            "@hono/hono": ["GHSA-1234-asd7-89fg"],
            "@nashaddams/amqp": ["GHSA-1234-asd7-89fg"],
            "postgres": ["GHSA-1234-asd7-89fg"],
            "axios": ["GHSA-1234-asd7-89fg"],
            "echarts": ["GHSA-1234-asd7-89fg"],
          },
        };
      },
    );

    const code = await audit({ lockFile: "test/audit/deno-lock/deno.lock" });

    assertEquals(code, 0);
    assertThrows(
      () => Deno.readTextFileSync(".audit/report.md"),
      Deno.errors.NotFound,
    );
  });
});
