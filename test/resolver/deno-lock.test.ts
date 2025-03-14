import { assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import DenoLockResolver from "../../src/resolver/deno-lock.ts";

describe("[resolver] deno-lock", () => {
  let tmpLockFile: string | undefined = undefined;

  beforeEach(() => {
    tmpLockFile = Deno.makeTempFileSync();
  });

  afterEach(() => {
    Deno.removeSync(tmpLockFile!);
  });

  it("should remove duplicates and url artifacts from ESM packages", () => {
    Deno.writeTextFileSync(
      tmpLockFile!,
      JSON.stringify({
        remote: {
          "https://esm.sh/echarts@5.5.1": "",
          "https://esm.sh/v135/echarts@5.5.1/lib/action/roamHelper.js": "", // /v135/
          "https://esm.sh/react@18.3.1": "",
          "https://esm.sh/stable/react@18.3.1/denonext/react.mjs": "", // /stable/
        },
      }),
    );

    const extracted = DenoLockResolver.extract(tmpLockFile!);
    const resolved = DenoLockResolver.origins.esm.normalize(extracted.esm);

    assertEquals(resolved, [
      { name: "echarts", version: "5.5.1" },
      { name: "echarts", version: "5.5.1" },
      { name: "react", version: "18.3.1" },
      { name: "react", version: "18.3.1" },
    ]);
  });

  it("should retain the scope for ESM packages", () => {
    Deno.writeTextFileSync(
      tmpLockFile!,
      JSON.stringify({
        remote: {
          "https://esm.sh/v135/@emotion/is-prop-valid@1.2.2/X-ZS9yZWFjdA/es2022/is-prop-valid.mjs":
            "",
        },
      }),
    );

    const extracted = DenoLockResolver.extract(tmpLockFile!);
    const resolved = DenoLockResolver.origins.esm.normalize(extracted.esm);

    assertEquals(resolved, [
      { name: "@emotion/is-prop-valid", version: "1.2.2" },
    ]);
  });

  it("should ignore packages without a version", () => {
    Deno.writeTextFileSync(
      tmpLockFile!,
      JSON.stringify({
        remote: {
          "https://esm.sh/v135/node_events.js": "",
          "https://esm.sh/v135/node_process.js": "",
        },
      }),
    );

    const extracted = DenoLockResolver.extract(tmpLockFile!);
    const resolved = DenoLockResolver.origins.esm.normalize(extracted.esm);

    assertEquals(resolved, []);
  });

  it("should extract deno.land packages", () => {
    Deno.writeTextFileSync(
      tmpLockFile!,
      JSON.stringify({
        remote: {
          "https://deno.land/std@0.214.0/crypto/_wasm/mod.ts": "",
          "https://deno.land/std@0.214.0/path/relative.ts": "",
          "https://deno.land/x/postgresjs@v3.4.5/mod.ts": "",
        },
      }),
    );

    const extracted = DenoLockResolver.extract(tmpLockFile!);
    const resolved = DenoLockResolver.origins.denoland.normalize(
      extracted.denoland,
    );

    assertEquals(resolved, [
      { name: "std", version: "0.214.0" },
      { name: "std", version: "0.214.0" },
      { name: "postgresjs", version: "v3.4.5" },
    ]);
  });

  it("should resolve NPM package keys containing multiple packages", () => {
    Deno.writeTextFileSync(
      tmpLockFile!,
      JSON.stringify({
        npm: {
          "@algolia/autocomplete-core@1.17.7_algoliasearch@5.18.0": {},
          "@algolia/autocomplete-plugin-algolia-insights@1.17.7_search-insights@2.17.3_algoliasearch@5.18.0":
            {},
          "@algolia/autocomplete-preset-algolia@1.17.7_@algolia+client-search@5.18.0_algoliasearch@5.18.0":
            {},
          "@vitejs/plugin-vue@5.2.1_vite@5.4.11_vue@3.5.13": {},
        },
      }),
    );

    const extracted = DenoLockResolver.extract(tmpLockFile!);
    const resolved = DenoLockResolver.origins.npm.normalize(extracted.npm);

    assertEquals(resolved, [
      { name: "@algolia/autocomplete-core", version: "1.17.7" },
      { name: "algoliasearch", version: "5.18.0" },
      {
        name: "@algolia/autocomplete-plugin-algolia-insights",
        version: "1.17.7",
      },
      { name: "search-insights", version: "2.17.3" },
      { name: "algoliasearch", version: "5.18.0" },
      { name: "@algolia/autocomplete-preset-algolia", version: "1.17.7" },
      { name: "@algolia/client-search", version: "5.18.0" },
      { name: "algoliasearch", version: "5.18.0" },
      { name: "@vitejs/plugin-vue", version: "5.2.1" },
      { name: "vite", version: "5.4.11" },
      { name: "vue", version: "3.5.13" },
    ]);
  });
});
