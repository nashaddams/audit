import type { PkgResolved } from "../src/types.ts";

type Advisory = NonNullable<PkgResolved["advisories"]>[number];

type Vulnerability = NonNullable<
  NonNullable<PkgResolved["advisories"]>[number]["vulnerabilities"]
>[number];

export const createVulnerability = (
  vulnerability?: Partial<Vulnerability>,
): Vulnerability => {
  return {
    package: {
      ecosystem: "other",
      name: null,
    },
    vulnerable_version_range: null,
    patched_versions: null,
    vulnerable_functions: null,
    ...vulnerability,
  };
};

export const createAdvisory = (advisory?: Partial<Advisory>): Advisory => {
  return {
    ghsa_id: "GHSA-2234-fmw7-43wr",
    cve_id: "CVE-2024-48913",
    url: "",
    html_url: "https://github.com",
    summary: "Bypass CSRF Middleware by a request without Content-Type header",
    description: null,
    severity: "medium",
    author: null,
    publisher: null,
    identifiers: [],
    state: "published",
    created_at: null,
    updated_at: null,
    published_at: "2024-10-15T08:21:06Z",
    closed_at: null,
    withdrawn_at: null,
    submission: null,
    vulnerabilities: [],
    cwes: [{
      cwe_id: "CWE-352",
      name: "Cross-Site Request Forgery (CSRF)",
    }],
    cwe_ids: null,
    credits: null,
    credits_detailed: null,
    collaborating_users: null,
    collaborating_teams: null,
    private_fork: null,
    cvss: null,
    ...advisory,
  };
};

export const createVulnPkg = (
  pkgVersion: string,
  ...vulnVersions: string[]
): PkgResolved => {
  return {
    origin: "",
    name: "",
    version: pkgVersion,
    advisories: [
      createAdvisory({
        vulnerabilities: vulnVersions.map((v) =>
          createVulnerability({
            package: {
              ecosystem: "other",
              name: null,
            },
            vulnerable_version_range: v,
            patched_versions: null,
            vulnerable_functions: null,
          })
        ),
      }),
    ],
  };
};
