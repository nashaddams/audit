import {
  greaterThan,
  greaterThanRange,
  isRange,
  isSemVer,
  parse,
  type Range,
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
        return true;
      }

      const pkgVersion = parse(pkg.version);
      const vulnerabilityVersions: (SemVer | Range)[] = (pkg.advisories ?? [])
        .flatMap((a) =>
          a.vulnerabilities?.map((v) => v.vulnerable_version_range)
        )
        .filter((vv): vv is string => typeof vv === "string")
        .map((vulnVersion) => {
          // console.log("@@@@@@@@@@@@", vulnVersion);
          let version: SemVer | Range | undefined =
            tryParseRange(vulnVersion) ?? tryParse(vulnVersion);

          if (!version) {
            version = tryParseRange(vulnVersion.replaceAll(",", " "));
          }

          if (!version) {
            console.warn(
              `Unable to parse version for ${pkg.name}@${pkg.version}`,
            );
            return undefined;
          }

          return version;
        })
        .filter((vv): vv is SemVer | Range => isSemVer(vv) || isRange(vv));

      for (const vv of vulnerabilityVersions) {
        if (
          (isRange(vv) && greaterThanRange(pkgVersion, vv)) ||
          (isSemVer(vv) && greaterThan(pkgVersion, vv))
        ) {
          return false;
        }
      }

      return true;
    });
  }

  return [];
};
