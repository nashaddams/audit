import type { GithubAdvisories } from "../../src/types.ts";

export const githubAdvisories: GithubAdvisories = [{
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
}, {
  "ghsa_id": "GHSA-fhv8-fx5f-7fxf",
  "cve_id": "CVE-2021-39227",
  "url":
    "https://api.github.com/repos/ecomfe/zrender/security-advisories/GHSA-fhv8-fx5f-7fxf",
  "html_url":
    "https://github.com/ecomfe/zrender/security/advisories/GHSA-fhv8-fx5f-7fxf",
  "summary": "Prototype Pollution in zrender",
  "description":
    "### Impact\r\nUsing `merge` and `clone` helper methods in the `src/core/util.ts` module will have prototype pollution. It will affect the popular data visualization library Apache ECharts, which is using and exported these two methods directly.\r\n\r\n### Patches\r\n \r\nIt has been patched in https://github.com/ecomfe/zrender/pull/826. \r\nUsers should update zrender to `5.2.1`.  and update echarts to `5.2.1` if project is using echarts.\r\n\r\n### References\r\nNA\r\n\r\n### For more information\r\nNA\r\n",
  "severity": "low",
  "author": null,
  "publisher": {
    "login": "pissang",
    "id": 841551,
    "node_id": "MDQ6VXNlcjg0MTU1MQ==",
    "avatar_url": "https://avatars.githubusercontent.com/u/841551?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/pissang",
    "html_url": "https://github.com/pissang",
    "followers_url": "https://api.github.com/users/pissang/followers",
    "following_url":
      "https://api.github.com/users/pissang/following{/other_user}",
    "gists_url": "https://api.github.com/users/pissang/gists{/gist_id}",
    "starred_url":
      "https://api.github.com/users/pissang/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/pissang/subscriptions",
    "organizations_url": "https://api.github.com/users/pissang/orgs",
    "repos_url": "https://api.github.com/users/pissang/repos",
    "events_url": "https://api.github.com/users/pissang/events{/privacy}",
    "received_events_url":
      "https://api.github.com/users/pissang/received_events",
    "type": "User",
    "user_view_type": "public",
    "site_admin": false,
  },
  "identifiers": [
    {
      "value": "GHSA-fhv8-fx5f-7fxf",
      "type": "GHSA",
    },
    {
      "value": "CVE-2021-39227",
      "type": "CVE",
    },
  ],
  "state": "published",
  "created_at": null,
  "updated_at": "2021-09-17T13:12:12Z",
  "published_at": "2021-09-17T02:23:12Z",
  "closed_at": null,
  "withdrawn_at": null,
  "submission": null,
  "vulnerabilities": [
    {
      "package": {
        "ecosystem": "npm",
        "name": "zrender",
      },
      "vulnerable_version_range": "<= 5.2.0, <= 4.3.2",
      "patched_versions": "5.2.1, 4.3.3",
      "vulnerable_functions": [],
    },
  ],
  "cvss_severities": {
    "cvss_v3": {
      "vector_string": null,
      "score": null,
    },
    "cvss_v4": {
      "vector_string": null,
      "score": null,
    },
  },
  "cwes": [
    {
      "cwe_id": "CWE-1321",
      "name":
        "Improperly Controlled Modification of Object Prototype Attributes ('Prototype Pollution')",
    },
  ],
  "cwe_ids": [
    "CWE-1321",
  ],
  "credits": [
    {
      "login": "Asjidkalam",
      "type": "analyst",
    },
    {
      "login": "huntr-helper",
      "type": "analyst",
    },
  ],
  "credits_detailed": [
    {
      "user": {
        "login": "Asjidkalam",
        "id": 16708391,
        "node_id": "MDQ6VXNlcjE2NzA4Mzkx",
        "avatar_url": "https://avatars.githubusercontent.com/u/16708391?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/Asjidkalam",
        "html_url": "https://github.com/Asjidkalam",
        "followers_url": "https://api.github.com/users/Asjidkalam/followers",
        "following_url":
          "https://api.github.com/users/Asjidkalam/following{/other_user}",
        "gists_url": "https://api.github.com/users/Asjidkalam/gists{/gist_id}",
        "starred_url":
          "https://api.github.com/users/Asjidkalam/starred{/owner}{/repo}",
        "subscriptions_url":
          "https://api.github.com/users/Asjidkalam/subscriptions",
        "organizations_url": "https://api.github.com/users/Asjidkalam/orgs",
        "repos_url": "https://api.github.com/users/Asjidkalam/repos",
        "events_url":
          "https://api.github.com/users/Asjidkalam/events{/privacy}",
        "received_events_url":
          "https://api.github.com/users/Asjidkalam/received_events",
        "type": "User",
        "user_view_type": "public",
        "site_admin": false,
      },
      "type": "analyst",
      "state": "accepted",
    },
    {
      "user": {
        "login": "huntr-helper",
        "id": 61279246,
        "node_id": "MDQ6VXNlcjYxMjc5MjQ2",
        "avatar_url": "https://avatars.githubusercontent.com/u/61279246?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/huntr-helper",
        "html_url": "https://github.com/huntr-helper",
        "followers_url": "https://api.github.com/users/huntr-helper/followers",
        "following_url":
          "https://api.github.com/users/huntr-helper/following{/other_user}",
        "gists_url":
          "https://api.github.com/users/huntr-helper/gists{/gist_id}",
        "starred_url":
          "https://api.github.com/users/huntr-helper/starred{/owner}{/repo}",
        "subscriptions_url":
          "https://api.github.com/users/huntr-helper/subscriptions",
        "organizations_url": "https://api.github.com/users/huntr-helper/orgs",
        "repos_url": "https://api.github.com/users/huntr-helper/repos",
        "events_url":
          "https://api.github.com/users/huntr-helper/events{/privacy}",
        "received_events_url":
          "https://api.github.com/users/huntr-helper/received_events",
        "type": "User",
        "user_view_type": "public",
        "site_admin": false,
      },
      "type": "analyst",
      "state": "accepted",
    },
  ],
  "collaborating_users": null,
  "collaborating_teams": null,
  "private_fork": null,
  "cvss": {
    "vector_string": null,
    "score": null,
  },
}];
