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
import { File } from "./file.ts";

const sanitizeVersionRange = (versionRange: string): string => {
  return versionRange
    .replaceAll(",", " || ")
    .replaceAll(";", " || ")
    .replaceAll("=<", "<=")
    .replaceAll("=>", ">=");
};

const transformVersionRangeWithPlus = (versionRange: string): string => {
  // Match version ranges like 7+
  const regex = /^(\d+)\+$/;

  if (!regex.test(versionRange)) {
    return versionRange;
  }

  return versionRange.replace(/^(\d+)\+$/, ">=$1");
};

/** @internal */
export const match = (pkgs: PkgResolved[]): PkgResolved[] => {
  return pkgs.filter((pkg) => {
    const pkgVersion = parse(pkg.version);
    const vulnerabilityVersions: (SemVer | Range)[] = (pkg.advisories ?? [])
      .flatMap((a) =>
        a.vulnerabilities
          ?.filter((v) => pkg.name.includes(v.package?.name ?? ""))
          .map((v) => v.vulnerable_version_range)
      )
      .filter((vv): vv is string => typeof vv === "string")
      .map((vv) => {
        let version: SemVer | Range | undefined = tryParse(vv) ??
          tryParseRange(vv);

        if (!version) {
          version = tryParseRange(
            transformVersionRangeWithPlus(
              sanitizeVersionRange(vv),
            ),
          );
        }

        if (!version) {
          console.warn(
            `\nUnable to parse version for ${pkg.name}@${pkg.version}`,
          );
          console.warn(`Package version: ${pkg.version}`);
          console.warn(`Vulnerability version: ${vv}`);

          File.writeUnresolvedPackage(
            `${pkg.name}/${pkg.version} (unparseable vulnerability version: ${vv})`,
          );

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
};
