import type { NpmAuditResult } from "../../src/types.ts";

export const npmAuditEsmOnly: NpmAuditResult = {
  "auditReportVersion": 2,
  "vulnerabilities": {
    "handlebars": {
      "name": "handlebars",
      "severity": "critical",
      "isDirect": true,
      "via": [
        {
          "source": 1095063,
          "name": "handlebars",
          "dependency": "handlebars",
          "title":
            "Remote code execution in handlebars when compiling templates",
          "url": "https://github.com/advisories/GHSA-f2jv-r9rf-7988",
          "severity": "critical",
          "cwe": [
            "CWE-94",
          ],
          "cvss": {
            "score": 9.8,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
          },
          "range": "<4.7.7",
        },
        {
          "source": 1095465,
          "name": "handlebars",
          "dependency": "handlebars",
          "title": "Prototype Pollution in handlebars",
          "url": "https://github.com/advisories/GHSA-765h-qjxv-5f44",
          "severity": "critical",
          "cwe": [
            "CWE-1321",
          ],
          "cvss": {
            "score": 9.8,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
          },
          "range": "<4.7.7",
        },
        "optimist",
      ],
      "effects": [],
      "range": "<=4.7.6",
      "nodes": [
        "node_modules/handlebars",
      ],
      "fixAvailable": {
        "name": "handlebars",
        "version": "4.7.8",
        "isSemVerMajor": false,
      },
    },
    "minimist": {
      "name": "minimist",
      "severity": "critical",
      "isDirect": false,
      "via": [
        {
          "source": 1096466,
          "name": "minimist",
          "dependency": "minimist",
          "title": "Prototype Pollution in minimist",
          "url": "https://github.com/advisories/GHSA-vh95-rmgr-6w4m",
          "severity": "moderate",
          "cwe": [
            "CWE-1321",
          ],
          "cvss": {
            "score": 5.6,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:L",
          },
          "range": "<0.2.1",
        },
        {
          "source": 1097677,
          "name": "minimist",
          "dependency": "minimist",
          "title": "Prototype Pollution in minimist",
          "url": "https://github.com/advisories/GHSA-xvch-5gv4-984h",
          "severity": "critical",
          "cwe": [
            "CWE-1321",
          ],
          "cvss": {
            "score": 9.8,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
          },
          "range": "<0.2.4",
        },
      ],
      "effects": [
        "optimist",
      ],
      "range": "<=0.2.3",
      "nodes": [
        "node_modules/minimist",
      ],
      "fixAvailable": {
        "name": "handlebars",
        "version": "4.7.8",
        "isSemVerMajor": false,
      },
    },
    "optimist": {
      "name": "optimist",
      "severity": "critical",
      "isDirect": false,
      "via": [
        "minimist",
      ],
      "effects": [
        "handlebars",
      ],
      "range": ">=0.6.0",
      "nodes": [
        "node_modules/optimist",
      ],
      "fixAvailable": {
        "name": "handlebars",
        "version": "4.7.8",
        "isSemVerMajor": false,
      },
    },
  },
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 0,
      "moderate": 0,
      "high": 0,
      "critical": 3,
      "total": 3,
    },
    "dependencies": {
      "prod": 15,
      "dev": 0,
      "optional": 1,
      "peer": 0,
      "peerOptional": 0,
      "total": 15,
    },
  },
};
