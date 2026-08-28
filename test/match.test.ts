import { describe, it } from "@std/testing/bdd";
import { assertSnapshot } from "@std/testing/snapshot";
import { match } from "../src/match.ts";
import type { PkgResolved } from "../src/types.ts";
import resolved from "./mock/resolved.json" with { type: "json" };

const extractPkgAndVulnVersions = (
  pkgs: PkgResolved[],
): [string, string | undefined, (string | null | undefined)[]][] => {
  return pkgs.map((pkg) => [
    pkg.name,
    pkg.version,
    pkg.advisories!.flatMap((a) =>
      a.vulnerabilities?.map((v) => v.vulnerable_version_range)
    ),
  ]);
};

describe("match", () => {
  it("should match versions and version ranges", async (t) => {
    const beforeMatch = extractPkgAndVulnVersions(resolved as PkgResolved[]);
    await assertSnapshot(t, beforeMatch, {
      name: "Match (before)",
      path: `${import.meta.dirname}/__snapshots__/match-before.snap`,
    });

    const afterMatch = match(resolved as PkgResolved[]);
    await assertSnapshot(t, extractPkgAndVulnVersions(afterMatch), {
      name: "Match (after)",
      path: `${import.meta.dirname}/__snapshots__/match-after.snap`,
    });
  });
});
