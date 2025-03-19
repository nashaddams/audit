import { stub } from "@std/testing/mock";
import { Api } from "../../src/api.ts";
import { Advisories } from "./advisories.ts";

export const Stub = {
  fetchJsrPkg: stub(
    Api,
    "fetchJsrPkg",
    async ({ scope, pkg }) => {
      return await Promise.resolve({
        githubRepository: { owner: scope, name: pkg },
      });
    },
  ),
  fetchDenolandPkg: stub(
    Api,
    "fetchDenolandPkg",
    async ({ pkg, version }) => {
      return await Promise.resolve({
        upload_options: {
          type: "github",
          repository: `some/${pkg}`,
          ref: version,
        },
      });
    },
  ),
  fetchNpmPkg: stub(
    Api,
    "fetchNpmPkg",
    async ({ pkg }) => {
      return await Promise.resolve({
        repository: {
          url: `git+https://github.com/some/${pkg}.git`,
        },
      });
    },
  ),
  fetchGithubAdvisories: stub(
    Api,
    "fetchGithubAdvisories",
    async ({ repo }) => {
      if (repo === "hono") {
        return await Promise.resolve(Advisories.jsr.hono);
      } else if (repo === "amqp") {
        return await Promise.resolve(Advisories.jsr.amqp);
      } else if (repo === "collections") {
        return await Promise.resolve(Advisories.jsr.stdCollections);
      } else if (repo === "postgres") {
        return await Promise.resolve(Advisories.denoland.postgres);
      } else if (repo === "axios") {
        return await Promise.resolve(Advisories.npm.axios);
      } else if (repo === "echarts") {
        return await Promise.resolve(Advisories.esm.echarts);
      } else {
        return await Promise.resolve([]);
      }
    },
  ),
};
