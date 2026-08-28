import type { PkgResolved } from "../../src/types.ts";

export type Advisory = NonNullable<PkgResolved["advisories"]>[number];

type Vulnerability = NonNullable<
  NonNullable<PkgResolved["advisories"]>[number]["vulnerabilities"]
>[number];

const createVulnerability = (
  vulnerability?: Partial<Vulnerability>,
): Vulnerability => {
  return {
    package: {
      ecosystem: "other",
      name: "test",
    },
    vulnerable_version_range: null,
    patched_versions: null,
    vulnerable_functions: null,
    ...vulnerability,
  };
};

const createAdvisory = (advisory?: Partial<Advisory>): Advisory => {
  return {
    ghsa_id: "GHSA-1234-asd7-89fg",
    cve_id: "CVE-2049-12345",
    url: "",
    html_url: "https://github.com/advisories",
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
    vulnerabilities: null,
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

const createPkg = (pkg?: Partial<PkgResolved>) => {
  return {
    origin: "test",
    name: "test",
    version: "0.0.0",
    ...pkg,
  };
};

interface Build {
  build: () => PkgResolved[] | Advisory[] | Vulnerability[];
}

interface VulnerabilityBuilder extends Build {
  withVulnerability: (
    vulnerability?: Partial<Vulnerability>,
  ) => Build;
  with: (
    ...fns: ((builder: VulnerabilityBuilder) => void)[]
  ) => Build;
}

interface AdvisoryBuilder extends Build {
  withAdvisory: (
    advisory?: Partial<Advisory>,
  ) => VulnerabilityBuilder;
  with: (
    ...fns: ((builder: AdvisoryBuilder) => void)[]
  ) => Build;
}

interface PkgBuilder extends Build {
  withPackage: (
    pkg?: Partial<PkgResolved>,
  ) => AdvisoryBuilder;
  with: (...fns: ((builder: PkgBuilder) => void)[]) => Build;
}

interface Builder extends VulnerabilityBuilder, AdvisoryBuilder, PkgBuilder {
  with: (...fns: ((builder: Builder) => void)[]) => Build;
}

export const builder = (): Builder => {
  const pkgs: PkgResolved[] = [];
  const advisories: Advisory[] = [];
  const vulnerabilities: Vulnerability[] = [];

  const build = (): PkgResolved[] | Advisory[] | Vulnerability[] => {
    if (pkgs.length) return pkgs;
    if (advisories.length) return advisories;
    if (vulnerabilities.length) return vulnerabilities;
    return [];
  };

  const vulnerabilityBuilder: VulnerabilityBuilder = {
    withVulnerability(vulnerability) {
      const pkg = pkgs[pkgs.length - 1];
      const adv = advisories[advisories.length - 1];
      const vuln = createVulnerability(vulnerability);

      if (pkg) {
        const pkgAdv = pkg.advisories?.[pkg.advisories?.length - 1];

        if (pkgAdv) {
          pkgAdv.vulnerabilities?.push(vuln);
        } else {
          vulnerabilities.push(vuln);
        }
      } else if (adv) {
        adv.vulnerabilities?.push(vuln);
      } else {
        vulnerabilities.push(vuln);
      }
      return { build };
    },
    with(...fns: ((builder: VulnerabilityBuilder) => void)[]) {
      fns.forEach((fn) => fn(this));
      return { build };
    },
    build,
  };

  const advisoryBuilder: AdvisoryBuilder = {
    withAdvisory(advisory) {
      const adv = {
        ...createAdvisory(advisory),
        vulnerabilities: [],
      };

      const pkg = pkgs[pkgs.length - 1];
      if (pkg) {
        pkg.advisories?.push(adv);
      } else {
        advisories.push(adv);
      }
      return vulnerabilityBuilder;
    },
    with(...fns: ((builder: AdvisoryBuilder) => void)[]) {
      fns.forEach((fn) => fn(this));
      return { build };
    },
    build,
  };

  const pkgBuilder: PkgBuilder = {
    withPackage(pkg) {
      pkgs.push({ ...createPkg(pkg), advisories: [] });
      return advisoryBuilder;
    },
    with(
      ...fns: ((builder: PkgBuilder) => void)[]
    ) {
      fns.forEach((fn) => fn(this));
      return { build };
    },
    build,
  };

  return {
    ...vulnerabilityBuilder,
    ...advisoryBuilder,
    ...pkgBuilder,
    with(
      ...fns: ((builder: Builder) => void)[]
    ) {
      fns.forEach((fn) => fn(this));
      return { build };
    },
  };
};
