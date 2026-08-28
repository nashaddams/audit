import { assertEquals, assertObjectMatch } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { Api } from "../src/api.ts";

describe("api", () => {
  it("should fetch a JSR package", async () => {
    const jsrPackage = await Api.fetchJsrPackage({
      jsrScope: "nashaddams",
      jsrPackage: "audit",
    });

    assertObjectMatch(jsrPackage!, {
      githubRepository: {
        owner: "nashaddams",
        name: "audit",
      },
    });
  });

  it("should return null for a non-existent JSR package", async () => {
    const jsrPackage = await Api.fetchJsrPackage({
      jsrScope: "nashaddams",
      jsrPackage: "audittt",
    });

    assertEquals(jsrPackage, null);
  });

  it("should fetch GitHub security advisories", async () => {
    const advisories = await Api.fetchAdvisories({
      jsrScope: "nashaddams",
      jsrPackage: "audit",
    });

    assertEquals(advisories, []);
  });

  it("should return null for a non-existent Github repository", async () => {
    const fetchJsrPackageStub = stub(
      Api,
      "fetchJsrPackage",
      async () =>
        await Promise.resolve({ githubRepository: { name: "", owner: "" } }),
    );

    const advisories = await Api.fetchAdvisories({
      jsrScope: "nashaddams",
      jsrPackage: "audit",
    });

    fetchJsrPackageStub.restore();

    assertEquals(advisories, null);
  });
});
