import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { inferNameAndVersion } from "../../src/resolver/utils.ts";

describe("[resolver] utils", () => {
  it("should infer the name and version", () => {
    assertEquals(inferNameAndVersion("@std/collections@1.0.10"), {
      name: "@std/collections",
      version: "1.0.10",
    });

    assertEquals(inferNameAndVersion("ansi-regex@3.0.1"), {
      name: "ansi-regex",
      version: "3.0.1",
    });

    assertEquals(inferNameAndVersion("@ansi-regex@"), null);
    assertEquals(inferNameAndVersion("ansi-regex@"), null);
    assertEquals(inferNameAndVersion("node_events.js"), null);
    assertEquals(inferNameAndVersion("@node/node_events.js"), null);
  });
});
