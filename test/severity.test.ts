import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { inferSeverities } from "../src/severity.ts";

describe("severity", () => {
  it("should infer the severities for a given severity", () => {
    assertEquals(inferSeverities("critical"), ["critical"]);
    assertEquals(inferSeverities("high"), ["high", "critical"]);
    assertEquals(inferSeverities("medium"), ["medium", "high", "critical"]);
    assertEquals(inferSeverities("low"), ["low", "medium", "high", "critical"]);
  });
});
