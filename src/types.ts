import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

export const severities = ["low", "moderate", "high", "critical"] as const;

export type Severity = typeof severities[number];

export type OutOptions = {
  dir: string;
};

export type Lock = {
  jsr: Record<string, unknown>;
  npm: Record<string, unknown>;
  remote: Record<string, unknown>;
};

export type Package = {
  name: string;
  version: string;
};

export type ExtractPackages = (
  lockFile: string,
  options: { verbose?: boolean; silent?: boolean },
) => {
  jsr: Package[];
  npm: Package[];
  esm: Package[];
};

export type RunAudit = (
  packages: Package[],
  options: {
    severity: Severity;
    silent?: boolean;
  },
) => number | Promise<number>;

// See https://github.com/jsr-io/jsr/blob/main/frontend/utils/api.ts
export type JsrPackage = {
  githubRepository: {
    owner: string;
    name: string;
  } | null;
};

// See https://github.com/octokit/plugin-rest-endpoint-methods.js/#typescript
export type GitHubAdvisories =
  RestEndpointMethodTypes["securityAdvisories"]["listRepositoryAdvisories"][
    "response"
  ]["data"];

// Inferred from `npm audit --json` output
export type NpmAuditResult = {
  auditReportVersion: number;
  vulnerabilities?: {
    [key: string]: {
      name?: string;
      severity?: string;
      isDirect?: boolean;
      via?: ({
        source?: number;
        name?: string;
        dependency?: string;
        title?: string;
        url?: string;
        severity?: string;
        cwe?: string[];
        cvss?: {
          score?: number;
          vectorString?: string | null;
        };
        range?: string;
      } | string)[];
      effects?: string[];
      range?: string;
      nodes?: string[];
      fixAvailable?: {
        name?: string;
        version?: string;
        isSemVerMajor?: boolean;
      };
    };
  };
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
    dependencies: {
      prod: number;
      dev: number;
      optional: number;
      peer: number;
      peerOptional: number;
      total: number;
    };
  };
};
