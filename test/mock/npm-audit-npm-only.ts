import type { NpmAuditResult } from "../../src/types.ts";

export const npmAuditNpmOnly: NpmAuditResult = {
  "auditReportVersion": 2,
  "vulnerabilities": {
    "axios": {
      "name": "axios",
      "severity": "high",
      "isDirect": true,
      "via": [
        {
          "source": 1098583,
          "name": "axios",
          "dependency": "axios",
          "title": "Server-Side Request Forgery in axios",
          "url": "https://github.com/advisories/GHSA-8hc4-vh64-cxmj",
          "severity": "high",
          "cwe": [
            "CWE-918",
          ],
          "cvss": {
            "score": 0,
            "vectorString": null,
          },
          "range": ">=1.3.2 <=1.7.3",
        },
      ],
      "effects": [],
      "range": "1.3.2 - 1.7.3",
      "nodes": [
        "node_modules/axios",
      ],
      "fixAvailable": {
        "name": "axios",
        "version": "1.7.9",
        "isSemVerMajor": false,
      },
    },
    "body-parser": {
      "name": "body-parser",
      "severity": "high",
      "isDirect": true,
      "via": [
        {
          "source": 1099520,
          "name": "body-parser",
          "dependency": "body-parser",
          "title":
            "body-parser vulnerable to denial of service when url encoding is enabled",
          "url": "https://github.com/advisories/GHSA-qwcr-r2fm-qrc7",
          "severity": "high",
          "cwe": [
            "CWE-405",
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
          },
          "range": "<1.20.3",
        },
      ],
      "effects": [
        "express",
      ],
      "range": "<1.20.3",
      "nodes": [
        "node_modules/body-parser",
      ],
      "fixAvailable": {
        "name": "express",
        "version": "4.21.2",
        "isSemVerMajor": false,
      },
    },
    "cookie": {
      "name": "cookie",
      "severity": "low",
      "isDirect": true,
      "via": [
        {
          "source": 1099846,
          "name": "cookie",
          "dependency": "cookie",
          "title":
            "cookie accepts cookie name, path, and domain with out of bounds characters",
          "url": "https://github.com/advisories/GHSA-pxg6-pf52-xh8x",
          "severity": "low",
          "cwe": [
            "CWE-74",
          ],
          "cvss": {
            "score": 0,
            "vectorString": null,
          },
          "range": "<0.7.0",
        },
      ],
      "effects": [
        "express",
      ],
      "range": "<0.7.0",
      "nodes": [
        "node_modules/cookie",
      ],
      "fixAvailable": {
        "name": "cookie",
        "version": "1.0.2",
        "isSemVerMajor": true,
      },
    },
    "express": {
      "name": "express",
      "severity": "high",
      "isDirect": true,
      "via": [
        {
          "source": 1096820,
          "name": "express",
          "dependency": "express",
          "title": "Express.js Open Redirect in malformed URLs",
          "url": "https://github.com/advisories/GHSA-rv95-896h-c2vc",
          "severity": "moderate",
          "cwe": [
            "CWE-601",
            "CWE-1286",
          ],
          "cvss": {
            "score": 6.1,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
          },
          "range": "<4.19.2",
        },
        {
          "source": 1100530,
          "name": "express",
          "dependency": "express",
          "title": "express vulnerable to XSS via response.redirect()",
          "url": "https://github.com/advisories/GHSA-qw6h-vgh9-j6wx",
          "severity": "low",
          "cwe": [
            "CWE-79",
          ],
          "cvss": {
            "score": 5,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:L",
          },
          "range": "<4.20.0",
        },
        "body-parser",
        "cookie",
        "path-to-regexp",
        "send",
        "serve-static",
      ],
      "effects": [],
      "range": "<=4.21.1 || 5.0.0-alpha.1 - 5.0.0",
      "nodes": [
        "node_modules/express",
      ],
      "fixAvailable": {
        "name": "express",
        "version": "4.21.2",
        "isSemVerMajor": false,
      },
    },
    "path-to-regexp": {
      "name": "path-to-regexp",
      "severity": "high",
      "isDirect": true,
      "via": [
        {
          "source": 1099562,
          "name": "path-to-regexp",
          "dependency": "path-to-regexp",
          "title": "path-to-regexp outputs backtracking regular expressions",
          "url": "https://github.com/advisories/GHSA-9wv6-86v2-598j",
          "severity": "high",
          "cwe": [
            "CWE-1333",
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
          },
          "range": "<0.1.10",
        },
        {
          "source": 1101081,
          "name": "path-to-regexp",
          "dependency": "path-to-regexp",
          "title": "Unpatched `path-to-regexp` ReDoS in 0.1.x",
          "url": "https://github.com/advisories/GHSA-rhx6-c78j-4q9w",
          "severity": "moderate",
          "cwe": [
            "CWE-1333",
          ],
          "cvss": {
            "score": 0,
            "vectorString": null,
          },
          "range": "<0.1.12",
        },
      ],
      "effects": [
        "express",
      ],
      "range": "<=0.1.11",
      "nodes": [
        "node_modules/path-to-regexp",
      ],
      "fixAvailable": {
        "name": "express",
        "version": "4.21.2",
        "isSemVerMajor": false,
      },
    },
    "send": {
      "name": "send",
      "severity": "low",
      "isDirect": true,
      "via": [
        {
          "source": 1100526,
          "name": "send",
          "dependency": "send",
          "title": "send vulnerable to template injection that can lead to XSS",
          "url": "https://github.com/advisories/GHSA-m6fv-jmcg-4jfg",
          "severity": "low",
          "cwe": [
            "CWE-79",
          ],
          "cvss": {
            "score": 5,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:L",
          },
          "range": "<0.19.0",
        },
      ],
      "effects": [
        "express",
        "serve-static",
      ],
      "range": "<0.19.0",
      "nodes": [
        "node_modules/send",
      ],
      "fixAvailable": {
        "name": "send",
        "version": "1.1.0",
        "isSemVerMajor": true,
      },
    },
    "serve-static": {
      "name": "serve-static",
      "severity": "low",
      "isDirect": true,
      "via": [
        {
          "source": 1100528,
          "name": "serve-static",
          "dependency": "serve-static",
          "title":
            "serve-static vulnerable to template injection that can lead to XSS",
          "url": "https://github.com/advisories/GHSA-cm22-4g7w-348p",
          "severity": "low",
          "cwe": [
            "CWE-79",
          ],
          "cvss": {
            "score": 5,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:L",
          },
          "range": "<1.16.0",
        },
        "send",
      ],
      "effects": [
        "express",
      ],
      "range": "<=1.16.0",
      "nodes": [
        "node_modules/serve-static",
      ],
      "fixAvailable": {
        "name": "express",
        "version": "4.21.2",
        "isSemVerMajor": false,
      },
    },
  },
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 3,
      "moderate": 0,
      "high": 4,
      "critical": 0,
      "total": 7,
    },
    "dependencies": {
      "prod": 111,
      "dev": 0,
      "optional": 0,
      "peer": 0,
      "peerOptional": 0,
      "total": 110,
    },
  },
};
