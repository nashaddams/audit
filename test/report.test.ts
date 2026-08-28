import { describe, it } from "@std/testing/bdd";
import { assertSnapshot } from "@std/testing/snapshot";
import { Report } from "../src/report.ts";

describe("report", () => {
  it("should create a report with fallback values", async (t) => {
    const report = Report.createGithubAdvisoriesReport({
      pkgs: [{
        origin: "jsr",
        name: "amqp",
        advisories: [{
          ghsa_id: "",
          cve_id: null,
          url: "",
          html_url: "",
          summary: "",
          description: null,
          severity: null,
          author: null,
          publisher: null,
          identifiers: [],
          state: "published",
          created_at: null,
          updated_at: null,
          published_at: null,
          closed_at: null,
          withdrawn_at: null,
          submission: null,
          vulnerabilities: [{
            package: null,
            vulnerable_version_range: null,
            patched_versions: null,
            vulnerable_functions: null,
          }],
          cvss: null,
          cwes: null,
          cwe_ids: null,
          credits: null,
          credits_detailed: null,
          collaborating_users: null,
          collaborating_teams: null,
          private_fork: null,
        }],
      }],
    });

    await assertSnapshot(t, report, {
      name: "report fallback",
      path: `${import.meta.dirname}/__snapshots__/report.snap`,
    });
  });
});
