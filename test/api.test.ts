import { assertEquals, assertObjectMatch } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { Api } from "../src/api.ts";

describe("api", () => {
  it("should fetch a JSR package", async () => {
    const pkg = await Api.fetchJsrPkg({ scope: "nashaddams", pkg: "audit" });

    assertObjectMatch(pkg!, {
      githubRepository: { owner: "nashaddams", name: "audit" },
    });
  });

  it("should return null for a non-existent JSR package", async () => {
    const pkg = await Api.fetchJsrPkg({ scope: "nashaddams", pkg: "audittt" });

    assertEquals(pkg, null);
  });

  it("should return null for an unlinked JSR package", async () => {
    const fetchJsrPkgStub = stub(
      Api,
      "fetchJsrPkg",
      async () => await Promise.resolve({ githubRepository: null }),
    );

    const pkg = await Api.fetchJsrPkg({ scope: "nashaddams", pkg: "audit" });

    fetchJsrPkgStub.restore();

    assertEquals(pkg!.githubRepository, null);
  });

  it("should fetch GitHub security advisories", async () => {
    const advisories = await Api.fetchGithubAdvisories({
      owner: "nashaddams",
      repo: "audit",
    });

    assertEquals(advisories, []);
  });

  it("should return null for a non-existent Github repository", async () => {
    const advisories = await Api.fetchGithubAdvisories({
      owner: "nashaddams",
      repo: "audittt",
    });

    assertEquals(advisories, null);
  });
});
