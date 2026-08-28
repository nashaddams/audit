import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { type Stub, stub } from "@std/testing/mock";
import { assertSnapshot } from "@std/testing/snapshot";
import { audit } from "../mod.ts";
import { Api } from "../src/api.ts";
import { Cmd } from "../src/cmd.ts";
import { githubAdvisories } from "./mock/github-advisories.ts";
import { npmAuditAll } from "./mock/npm-audit-all.ts";
import { npmAuditNpmOnly } from "./mock/npm-audit-npm-only.ts";
import { npmAuditEsmOnly } from "./mock/npm-audit-esm-only.ts";

describe("audit", () => {
  let fetchAdvisoriesStub: Stub | undefined = undefined;
  let npmAuditStub: Stub | undefined = undefined;

  beforeEach(() => {
    fetchAdvisoriesStub = stub(
      Api,
      "fetchAdvisories",
      async () => await Promise.resolve(githubAdvisories),
    );
  });

  afterEach(() => {
    fetchAdvisoriesStub?.restore();
    npmAuditStub?.restore();
  });

  it("should audit JSR packages", async (t) => {
    await audit({
      lock: "test/examples/jsr-only/deno.lock",
      severity: "low",
      silent: true,
    });
    await assertSnapshot(
      t,
      Deno.readTextFileSync(".audit/audit-jsr-report.md"),
      {
        name: "JSR only",
        path: `${import.meta.dirname}/__snapshots__/jsr-only.snap`,
      },
    );
  });

  it("should audit NPM packages", async (t) => {
    npmAuditStub = stub(
      Cmd,
      "npmAudit",
      () => ({ code: 1, stdout: JSON.stringify(npmAuditNpmOnly), stderr: "" }),
    );

    await audit({
      lock: "test/examples/npm-only/deno.lock",
      severity: "low",
      silent: true,
    });

    await assertSnapshot(
      t,
      Deno.readTextFileSync(".audit/audit-npm-report.md"),
      {
        name: "NPM only",
        path: `${import.meta.dirname}/__snapshots__/npm-only.snap`,
      },
    );
  });

  it("should audit ESM packages", async (t) => {
    npmAuditStub = stub(
      Cmd,
      "npmAudit",
      () => ({ code: 1, stdout: JSON.stringify(npmAuditEsmOnly), stderr: "" }),
    );

    await audit({
      lock: "test/examples/esm-only/deno.lock",
      severity: "low",
      silent: true,
    });

    await assertSnapshot(
      t,
      Deno.readTextFileSync(".audit/audit-npm-report.md"),
      {
        name: "ESM only",
        path: `${import.meta.dirname}/__snapshots__/esm-only.snap`,
      },
    );
  });

  it("should audit all packages", async (t) => {
    npmAuditStub = stub(
      Cmd,
      "npmAudit",
      () => ({ code: 1, stdout: JSON.stringify(npmAuditAll), stderr: "" }),
    );

    await audit({
      lock: "test/examples/all/deno.lock",
      severity: "low",
      silent: true,
    });

    await assertSnapshot(
      t,
      Deno.readTextFileSync(".audit/audit-jsr-report.md"),
      {
        name: "All (JSR)",
        path: `${import.meta.dirname}/__snapshots__/all.snap`,
      },
    );

    await assertSnapshot(
      t,
      Deno.readTextFileSync(".audit/audit-npm-report.md"),
      {
        name: "All (NPM/ESM)",
        path: `${import.meta.dirname}/__snapshots__/all.snap`,
      },
    );
  });
});
