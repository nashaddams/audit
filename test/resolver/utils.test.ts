import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  inferNameAndVersion,
  inferOwnerAndRepoFromGithubUrl,
} from "../../src/resolver/utils.ts";

describe("[resolver] utils", () => {
  it("should infer the name and version", () => {
    assertEquals(inferNameAndVersion("@std/collections@1.0.10"), {
      name: "@std/collections",
      version: "1.0.10",
    });

    assertEquals(inferNameAndVersion("ansi-regex@3.0.1"), {
      name: "ansi-regex",
      version: "3.0.1",
    });

    assertEquals(inferNameAndVersion("@ansi-regex@"), null);
    assertEquals(inferNameAndVersion("ansi-regex@"), null);
    assertEquals(inferNameAndVersion("node_events.js"), null);
    assertEquals(inferNameAndVersion("@node/node_events.js"), null);
  });

  it("should infer the owner and repository from Github URLs", () => {
    const gitHttps = inferOwnerAndRepoFromGithubUrl(
      "git+https://github.com/evanw/esbuild.git",
    );
    assertEquals(gitHttps, { owner: "evanw", repo: "esbuild" });

    const gitSsh = inferOwnerAndRepoFromGithubUrl(
      "git+ssh://git@github.com/colorjs/color-name.git",
    );
    assertEquals(gitSsh, { owner: "colorjs", repo: "color-name" });

    const git = inferOwnerAndRepoFromGithubUrl(
      "git://github.com/blakeembrey/array-flatten.git",
    );
    assertEquals(git, { owner: "blakeembrey", repo: "array-flatten" });

    const https = inferOwnerAndRepoFromGithubUrl(
      "https://github.com/babel/babel.git",
    );
    assertEquals(https, { owner: "babel", repo: "babel" });

    const main = inferOwnerAndRepoFromGithubUrl(
      "git+https://github.com/micromark/micromark.git#main",
    );
    assertEquals(main, { owner: "micromark", repo: "micromark" });
  });
});
