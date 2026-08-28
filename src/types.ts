import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

/** @internal */
export const severities = ["low", "moderate", "high", "critical"] as const;

/** @internal */
export type Severity = typeof severities[number];

/** @internal */
export type Pkg = {
  name: string;
  version?: string;
};

/** @internal */
export type RunAudit = (
  pkgs: Pkg[],
  options: {
    severity: Severity;
    silent: boolean;
    outputDir: string;
    githubToken?: string;
  },
) => number | Promise<number>;

// See https://github.com/jsr-io/jsr/blob/main/frontend/utils/api.ts
/** @internal */
export type JsrPkg = {
  githubRepository: {
    owner: string;
    name: string;
  } | null;
};

// See https://github.com/octokit/plugin-rest-endpoint-methods.js/#typescript
/** @internal */
export type GithubAdvisories =
  RestEndpointMethodTypes["securityAdvisories"]["listRepositoryAdvisories"][
    "response"
  ]["data"];

// Inferred from `npm audit --json` output
/** @internal */
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
