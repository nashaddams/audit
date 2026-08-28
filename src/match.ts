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

const transformVersionRanges = (versionRange: string): string => {
  // Match version ranges like "8.0.0-alpha.0 - 8.0.0-alpha.16" or "8.0.1 - 8.0.2"
  const dashVersionRangeRegex =
    /([\d.]+(?:-[a-zA-Z\d.]+)?)\s*-\s*([\d.]+(?:-[a-zA-Z\d.]+)?)/g;

  // Only transform version ranges containing a dash
  if (!dashVersionRangeRegex.test(versionRange)) {
    return versionRange;
  }

  // Match other (valid) version ranges like "<7.26.10" or ">10.0.0"
  const versionRangeRegex = /(<|>)=?[\d.]+(?:-[a-zA-Z\d.]+)?/g;

  const versionRanges = versionRange.match(versionRangeRegex) || [];
  const dashVersionRanges = versionRange.match(dashVersionRangeRegex) || [];

  // Add range operators
  const transformedRanges = dashVersionRanges.map((range) => {
    const [, start, end] = range.match(
      /([\d.]+(?:-[a-zA-Z\d.]+)?)\s*-\s*([\d.]+(?:-[a-zA-Z\d.]+)?)/,
    ) || [];
    return `>=${start} <=${end}`;
  });

  // Combine the ranges with "||"
  return [...versionRanges, ...transformedRanges].join(" || ");
};

/** @internal */
export const match = (pkgs: PkgResolved[]): PkgResolved[] => {
  return pkgs.filter((pkg) => {
    if (!pkg.version) {
      console.warn(`\nNo version found for ${pkg.name}`);
      return false;
    }

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
          // Remove comma and replace dash separators with proper operators
          version = tryParseRange(
            transformVersionRanges(vv.replaceAll(",", " ")),
          );
        }

        if (!version) {
          console.warn(
            `\nUnable to parse version for ${pkg.name}@${pkg.version}`,
          );
          console.warn(`Package version: ${pkg.version}`);
          console.warn(`Vulnerability version: ${vv}`);

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
