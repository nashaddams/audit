import { assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { ResolverRegistry } from "../../src/resolver/mod.ts";
import { File } from "../../src/file.ts";

describe("[resolver] deno-lock", () => {
  let tmpLockFile: string | undefined = undefined;

  beforeEach(() => {
    tmpLockFile = Deno.makeTempFileSync();
  });

  afterEach(() => {
    Deno.removeSync(tmpLockFile!);
    File.clearOutputDir();
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

    const extracted = ResolverRegistry["deno-lock"].extract(tmpLockFile!);
    const resolved = ResolverRegistry["deno-lock"].origins.esm.normalize(
      extracted.esm,
    );

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

    const extracted = ResolverRegistry["deno-lock"].extract(tmpLockFile!);
    const resolved = ResolverRegistry["deno-lock"].origins.esm.normalize(
      extracted.esm,
    );

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

    const extracted = ResolverRegistry["deno-lock"].extract(tmpLockFile!);
    const resolved = ResolverRegistry["deno-lock"].origins.esm.normalize(
      extracted.esm,
    );

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

    const extracted = ResolverRegistry["deno-lock"].extract(tmpLockFile!);
    const resolved = ResolverRegistry["deno-lock"].origins.denoland.normalize(
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
          "@algolia/autocomplete-core@1.17.7_algoliasearch@5.19.0": {},
          "@algolia/autocomplete-plugin-algolia-insights@1.17.7_search-insights@2.17.3_algoliasearch@5.19.0":
            {},
          "@algolia/autocomplete-preset-algolia@1.17.7_@algolia+client-search@5.19.0_algoliasearch@5.19.0":
            {},
          "@algolia/autocomplete-shared@1.17.7_@algolia+client-search@5.19.0_algoliasearch@5.19.0":
            {},
          "@docsearch/js@3.8.2_react@16.14.0_react-dom@16.14.0__react@16.14.0":
            {},
          "@docsearch/react@3.8.2_react@16.14.0_react-dom@16.14.0__react@16.14.0_algoliasearch@5.19.0":
            {},
          "@grafana/data@9.5.21_react@16.14.0_react-dom@16.14.0__react@16.14.0":
            {},
          "@mermaid-js/mermaid-mindmap@9.3.0_cytoscape@3.31.0": {},
          "@vitejs/plugin-vue@5.2.1_vite@5.4.11__@types+node@20.17.12_vue@3.5.13__typescript@5.7.3_@types+node@20.17.12_typescript@5.7.3":
            {},
          "@vue/server-renderer@3.5.13_vue@3.5.13__typescript@5.7.3": {},
          "@vueuse/core@11.3.0_vue@3.5.13__typescript@5.7.3_typescript@5.7.3":
            {},
          "@vueuse/integrations@11.3.0_axios@1.7.9_focus-trap@7.6.4_vue@3.5.13__typescript@5.7.3_typescript@5.7.3":
            {},
          "@vueuse/shared@11.3.0_vue@3.5.13__typescript@5.7.3_typescript@5.7.3":
            {},
          "bare-fs@2.3.5_bare-events@2.5.4": {},
          "bare-stream@2.6.3_bare-buffer@3.0.1_bare-events@2.5.4": {},
          "d3-transition@3.0.1_d3-selection@3.0.0": {},
          "d3-zoom@3.0.0_d3-selection@3.0.0": {},
          "d3@7.9.0_d3-selection@3.0.0": {},
          "esbuild-plugin-pino@2.2.1_esbuild@0.19.12": {},
          "fast_array_intersect@1.1.0": {},
          "fs.realpath@1.0.0": {},
          "http-cookie-agent@5.0.4_tough-cookie@4.1.4": {},
          "mermaid@10.9.3_cytoscape@3.31.0": {},
          "nano-css@5.6.2_react@16.14.0_react-dom@16.14.0__react@16.14.0": {},
          "react-dom@16.14.0_react@16.14.0": {},
          "react-universal-interface@0.6.2_react@16.14.0_tslib@2.5.0": {},
          "react-use@17.4.0_react@16.14.0_react-dom@16.14.0__react@16.14.0_tslib@2.5.0":
            {},
          "regexp.prototype.flags@1.5.4": {},
          "string_decoder@1.1.1": {},
          "ts-node@10.9.2_@types+node@22.10.6_typescript@5.7.3": {},
          "vite@5.4.11_@types+node@20.17.12": {},
          "vitepress-plugin-mermaid@2.0.17_mermaid@10.9.3__cytoscape@3.31.0_vitepress@1.5.0__vite@5.4.11___@types+node@20.17.12__vue@3.5.13___typescript@5.7.3__axios@1.7.9__focus-trap@7.6.4__@types+node@20.17.12__typescript@5.7.3__react@16.14.0__react-dom@16.14.0___react@16.14.0_axios@1.7.9_@types+node@20.17.12_typescript@5.7.3_react@16.14.0_react-dom@16.14.0__react@16.14.0":
            {},
          "vitepress-plugin-tabs@0.5.0_vitepress@1.5.0__vite@5.4.11___@types+node@20.17.12__vue@3.5.13___typescript@5.7.3__axios@1.7.9__focus-trap@7.6.4__@types+node@20.17.12__typescript@5.7.3__react@16.14.0__react-dom@16.14.0___react@16.14.0_vue@3.5.13__typescript@5.7.3_typescript@5.7.3_axios@1.7.9_@types+node@20.17.12_react@16.14.0_react-dom@16.14.0__react@16.14.0":
            {},
          "vitepress@1.5.0_vite@5.4.11__@types+node@20.17.12_vue@3.5.13__typescript@5.7.3_axios@1.7.9_focus-trap@7.6.4_@types+node@20.17.12_typescript@5.7.3_react@16.14.0_react-dom@16.14.0__react@16.14.0":
            {},
          "vue-demi@0.14.10_vue@3.5.13__typescript@5.7.3_typescript@5.7.3": {},
          "vue@3.5.13_typescript@5.7.3": {},
        },
      }),
    );

    const extracted = ResolverRegistry["deno-lock"].extract(tmpLockFile!);
    const resolved = ResolverRegistry["deno-lock"].origins.npm.normalize(
      extracted.npm,
    );

    assertEquals(resolved, [
      { name: "@algolia/autocomplete-core", version: "1.17.7" },
      { name: "algoliasearch", version: "5.19.0" },
      {
        name: "@algolia/autocomplete-plugin-algolia-insights",
        version: "1.17.7",
      },
      { name: "search-insights", version: "2.17.3" },
      { name: "algoliasearch", version: "5.19.0" },
      { name: "@algolia/autocomplete-preset-algolia", version: "1.17.7" },
      { name: "@algolia/client-search", version: "5.19.0" },
      { name: "algoliasearch", version: "5.19.0" },
      { name: "@algolia/autocomplete-shared", version: "1.17.7" },
      { name: "@algolia/client-search", version: "5.19.0" },
      { name: "algoliasearch", version: "5.19.0" },
      { name: "@docsearch/js", version: "3.8.2" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "@docsearch/react", version: "3.8.2" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "algoliasearch", version: "5.19.0" },
      { name: "@grafana/data", version: "9.5.21" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "@mermaid-js/mermaid-mindmap", version: "9.3.0" },
      { name: "cytoscape", version: "3.31.0" },
      { name: "@vitejs/plugin-vue", version: "5.2.1" },
      { name: "vite", version: "5.4.11" },
      { name: "@types/node", version: "20.17.12" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
      { name: "@types/node", version: "20.17.12" },
      { name: "typescript", version: "5.7.3" },
      { name: "@vue/server-renderer", version: "3.5.13" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
      { name: "@vueuse/core", version: "11.3.0" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
      { name: "typescript", version: "5.7.3" },
      { name: "@vueuse/integrations", version: "11.3.0" },
      { name: "axios", version: "1.7.9" },
      { name: "focus-trap", version: "7.6.4" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
      { name: "typescript", version: "5.7.3" },
      { name: "@vueuse/shared", version: "11.3.0" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
      { name: "typescript", version: "5.7.3" },
      { name: "bare-fs", version: "2.3.5" },
      { name: "bare-events", version: "2.5.4" },
      { name: "bare-stream", version: "2.6.3" },
      { name: "bare-buffer", version: "3.0.1" },
      { name: "bare-events", version: "2.5.4" },
      { name: "d3-transition", version: "3.0.1" },
      { name: "d3-selection", version: "3.0.0" },
      { name: "d3-zoom", version: "3.0.0" },
      { name: "d3-selection", version: "3.0.0" },
      { name: "d3", version: "7.9.0" },
      { name: "d3-selection", version: "3.0.0" },
      { name: "esbuild-plugin-pino", version: "2.2.1" },
      { name: "esbuild", version: "0.19.12" },
      { name: "fast_array_intersect", version: "1.1.0" },
      { name: "fs.realpath", version: "1.0.0" },
      { name: "http-cookie-agent", version: "5.0.4" },
      { name: "tough-cookie", version: "4.1.4" },
      { name: "mermaid", version: "10.9.3" },
      { name: "cytoscape", version: "3.31.0" },
      { name: "nano-css", version: "5.6.2" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "react-universal-interface", version: "0.6.2" },
      { name: "react", version: "16.14.0" },
      { name: "tslib", version: "2.5.0" },
      { name: "react-use", version: "17.4.0" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "tslib", version: "2.5.0" },
      { name: "regexp.prototype.flags", version: "1.5.4" },
      { name: "string_decoder", version: "1.1.1" },
      { name: "ts-node", version: "10.9.2" },
      { name: "@types/node", version: "22.10.6" },
      { name: "typescript", version: "5.7.3" },
      { name: "vite", version: "5.4.11" },
      { name: "@types/node", version: "20.17.12" },
      { name: "vitepress-plugin-mermaid", version: "2.0.17" },
      { name: "mermaid", version: "10.9.3" },
      { name: "cytoscape", version: "3.31.0" },
      { name: "vitepress", version: "1.5.0" },
      { name: "vite", version: "5.4.11" },
      { name: "@types/node", version: "20.17.12" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
      { name: "axios", version: "1.7.9" },
      { name: "focus-trap", version: "7.6.4" },
      { name: "@types/node", version: "20.17.12" },
      { name: "typescript", version: "5.7.3" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "axios", version: "1.7.9" },
      { name: "@types/node", version: "20.17.12" },
      { name: "typescript", version: "5.7.3" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "vitepress-plugin-tabs", version: "0.5.0" },
      { name: "vitepress", version: "1.5.0" },
      { name: "vite", version: "5.4.11" },
      { name: "@types/node", version: "20.17.12" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
      { name: "axios", version: "1.7.9" },
      { name: "focus-trap", version: "7.6.4" },
      { name: "@types/node", version: "20.17.12" },
      { name: "typescript", version: "5.7.3" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
      { name: "typescript", version: "5.7.3" },
      { name: "axios", version: "1.7.9" },
      { name: "@types/node", version: "20.17.12" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "vitepress", version: "1.5.0" },
      { name: "vite", version: "5.4.11" },
      { name: "@types/node", version: "20.17.12" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
      { name: "axios", version: "1.7.9" },
      { name: "focus-trap", version: "7.6.4" },
      { name: "@types/node", version: "20.17.12" },
      { name: "typescript", version: "5.7.3" },
      { name: "react", version: "16.14.0" },
      { name: "react-dom", version: "16.14.0" },
      { name: "react", version: "16.14.0" },
      { name: "vue-demi", version: "0.14.10" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
      { name: "typescript", version: "5.7.3" },
      { name: "vue", version: "3.5.13" },
      { name: "typescript", version: "5.7.3" },
    ]);
  });
});
