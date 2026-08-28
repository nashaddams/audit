import {
  equals,
  isRange,
  isSemVer,
  parse,
  type Range,
  satisfies,
  type SemVer,
  tryParse,
  tryParseRange,
} from "@std/semver";
import type { PkgResolved } from "./types.ts";

/** @internal */
export const match = (pkgs: PkgResolved[]): PkgResolved[] => {
  if (pkgs.length) {
    return pkgs.filter((pkg) => {
      if (!pkg.version) {
        console.warn(`\nNo version found for ${pkg.name}`);
        return true;
      }

      const pkgVersion = parse(pkg.version);
      const vulnerabilityVersions: (SemVer | Range)[] = (pkg.advisories ?? [])
        .flatMap((a) =>
          a.vulnerabilities?.map((v) => v.vulnerable_version_range)
        )
        .filter((vv): vv is string => typeof vv === "string")
        .map((vulnVersion) => {
          let version: SemVer | Range | undefined = tryParse(vulnVersion) ??
            tryParseRange(vulnVersion);

          if (!version) {
            version = tryParseRange(vulnVersion.replaceAll(",", " "));
          }

          if (!version) {
            console.warn(
              `\nUnable to parse version for ${pkg.name}@${pkg.version}`,
            );
            console.warn(`Package version: ${pkg.version}`);
            console.warn(`Vulnerability version: ${vulnVersion}`);

            return undefined;
          }

          return version;
        })
        .filter((vv): vv is SemVer | Range => isSemVer(vv) || isRange(vv));

      const isVulnerable: boolean[] = [];

      for (const vv of vulnerabilityVersions) {
        if (
          (isSemVer(vv) && equals(pkgVersion, vv)) ||
          (isRange(vv) && satisfies(pkgVersion, vv))
        ) {
          isVulnerable.push(true);
        }
      }

      return isVulnerable.includes(true);
    });
  }

  return [];
};
