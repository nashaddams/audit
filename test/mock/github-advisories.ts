import type { GitHubAdvisories } from "../../src/types.ts";

export const githubAdvisories: GitHubAdvisories = [{
  ghsa_id: "GHSA-32fx-h446-h8pf",
  cve_id: "CVE-2024-52793",
  html_url:
    "https://github.com/denoland/std/security/advisories/GHSA-32fx-h446-h8pf",
  summary:
    "XSS vulnerability in serveDir API of @std/http/file-server on POSIX systems",
  severity: "low",
  identifiers: [
    { value: "GHSA-32fx-h446-h8pf", type: "GHSA" },
    { value: "CVE-2024-52793", type: "CVE" },
  ],
  updated_at: "2024-11-22T11:11:40Z",
  published_at: "2024-11-22T11:11:39Z",
  vulnerabilities: [
    {
      package: { ecosystem: "other", name: "@std/http" }, // ecosystem: "jsr"
      vulnerable_version_range: "<= 1.0.10",
      patched_versions: "1.0.11",
      vulnerable_functions: [],
    },
  ],
  cvss: {
    vector_string: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N",
    score: null,
  },
  cwes: [
    {
      cwe_id: "CWE-80",
      name:
        "Improper Neutralization of Script-Related HTML Tags in a Web Page (Basic XSS)",
    },
  ],
  cwe_ids: ["CWE-80"],
  url: "",
  description: null,
  author: null,
  publisher: null,
  state: "published",
  created_at: null,
  closed_at: null,
  withdrawn_at: null,
  submission: null,
  credits: null,
  credits_detailed: null,
  collaborating_users: null,
  collaborating_teams: null,
  private_fork: null,
}, {
  ghsa_id: "GHSA-32fx-h446-h8pf",
  cve_id: "CVE-2024-52793",
  html_url:
    "https://github.com/denoland/std/security/advisories/GHSA-32fx-h446-h8pf",
  summary:
    "XSS vulnerability in serveDir API of @std/http/file-server on POSIX systems",
  severity: "low",
  identifiers: [
    { value: "GHSA-32fx-h446-h8pf", type: "GHSA" },
    { value: "CVE-2024-52793", type: "CVE" },
  ],
  updated_at: "2024-11-22T11:11:40Z",
  published_at: "2024-11-22T11:11:39Z",
  vulnerabilities: [
    {
      package: { ecosystem: "other", name: "@std/http" }, // ecosystem: "jsr"
      vulnerable_version_range: "<= 1.0.10",
      patched_versions: "1.0.11",
      vulnerable_functions: [],
    },
  ],
  cvss: {
    vector_string: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N",
    score: null,
  },
  cwes: [
    {
      cwe_id: "CWE-80",
      name:
        "Improper Neutralization of Script-Related HTML Tags in a Web Page (Basic XSS)",
    },
  ],
  cwe_ids: ["CWE-80"],
  url: "",
  description: null,
  author: null,
  publisher: null,
  state: "published",
  created_at: null,
  closed_at: null,
  withdrawn_at: null,
  submission: null,
  credits: null,
  credits_detailed: null,
  collaborating_users: null,
  collaborating_teams: null,
  private_fork: null,
}];
