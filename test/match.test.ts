import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { match } from "../src/match.ts";
import { createVulnPkg } from "./utils.ts";

describe("match versions", () => {
  it("should match for equal versions", () => {
    const pkg = createVulnPkg("1.2.3", "1.2.3");
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should not match for smaller versions", () => {
    const pkg = createVulnPkg("1.2.3", "1.2.2");
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });

  it("should not match for bigger versions", () => {
    const pkg = createVulnPkg("1.2.3", "1.2.4");
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });
});

describe("match version ranges", () => {
  it("should match for smaller or equal version range", () => {
    const pkg = createVulnPkg("1.2.3", "<= 1.2.3");
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should match for bigger or equal version range", () => {
    const pkg = createVulnPkg("1.2.3", ">= 1.2.3");
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should match for wildcard version range", () => {
    const pkg = createVulnPkg("1.2.3", "*");
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should match for multiple version ranges (or)", () => {
    const pkg = createVulnPkg("3.1.0", ">=0.59.0 <2.79.2 || >=3.0.0 <3.29.5");
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should match for multiple version ranges (comma)", () => {
    const pkg = createVulnPkg("6.0.5", ">=6.0.0, <=6.0.8");
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should match for prerelease version ranges", () => {
    const pkg = createVulnPkg("8.0.0-alpha.2", "8.0.0-alpha.0 - 8.0.0-alpha.3");
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should match for combined version ranges (comma, dash) 1", () => {
    const pkg = createVulnPkg(
      "7.25.9",
      "<7.26.10, 8.0.0-alpha.0 - 8.0.0-alpha.16",
    );
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should match for combined version ranges (comma, dash) 2", () => {
    const pkg = createVulnPkg(
      "8.0.0-alpha.3",
      "<7.26.10, 8.0.0-alpha.0 - 8.0.0-alpha.16",
    );
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should not match for smaller version range", () => {
    const pkg = createVulnPkg("1.2.3", "< 1.2.3");
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });

  it("should not match for bigger version range", () => {
    const pkg = createVulnPkg("1.2.3", ">= 1.2.4");
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });

  it("should not match for multiple version ranges (or)", () => {
    const pkg = createVulnPkg("2.80.2", ">=0.59.0 <2.79.2 || >=3.0.0 <3.29.5");
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });

  it("should not match for multiple version ranges (comma)", () => {
    const pkg = createVulnPkg("5.9.9", ">=6.0.0, <=6.0.8");
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });

  it("should not match for prerelease version ranges", () => {
    const pkg = createVulnPkg("8.0.0-alpha.4", "8.0.0-alpha.0 - 8.0.0-alpha.3");
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });

  it("should not match for combined version ranges (comma, dash) 1", () => {
    const pkg = createVulnPkg(
      "7.27.0",
      "<7.26.10, 8.0.0-alpha.0 - 8.0.0-alpha.16",
    );
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });

  it("should not match for combined version ranges (comma, dash) 2", () => {
    const pkg = createVulnPkg(
      "8.0.0-alpha.17",
      "<7.26.10, 8.0.0-alpha.0 - 8.0.0-alpha.16",
    );
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });
});

describe("match multiple", () => {
  it("should match if only one range applies", () => {
    const pkg = createVulnPkg("1.2.3", "<= 1.2.3", ">= 2.0.0");
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should match mixing versions with version ranges", () => {
    const pkg = createVulnPkg("1.2.3", "1.2.3", ">= 2.0.0");
    const matched = match([pkg]);
    assertEquals(matched.length, 1);
  });

  it("should not match if no range applies", () => {
    const pkg = createVulnPkg("1.2.4", "<= 1.2.3", ">= 2.0.0");
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });

  it("should not match mixing versions with version ranges", () => {
    const pkg = createVulnPkg("1.2.2", "1.2.3", ">= 2.0.0");
    const matched = match([pkg]);
    assertEquals(matched.length, 0);
  });
});
