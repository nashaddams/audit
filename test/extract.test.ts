import { assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { extractPackages } from "../src/extract.ts";

describe("extract", () => {
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

    const { esm } = extractPackages(tmpLockFile!, {
      silent: true,
      verbose: false,
    });

    assertEquals(esm, [
      { name: "echarts", version: "5.5.1" },
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

    const { esm } = extractPackages(tmpLockFile!, {
      silent: true,
      verbose: false,
    });

    assertEquals(esm, [
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

    const { esm } = extractPackages(tmpLockFile!, {
      silent: true,
      verbose: false,
    });

    assertEquals(esm, []);
  });

  it("should ignore explicitly ignored packages", () => {
    Deno.writeTextFileSync(
      tmpLockFile!,
      JSON.stringify({
        remote: {
          "https://esm.sh/echarts@5.5.1": "",
          "https://esm.sh/handlebars@4.5.3": "",
          "https://esm.sh/react@18.3.1": "",
        },
      }),
    );

    const { esm } = extractPackages(tmpLockFile!, {
      ignore: ["react", "handlebars"],
      silent: true,
      verbose: false,
    });

    assertEquals(esm, [
      { name: "echarts", version: "5.5.1" },
    ]);
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

    const { denoland } = extractPackages(tmpLockFile!, {
      silent: true,
      verbose: false,
    });

    assertEquals(denoland, [
      { name: "std", version: "0.214.0" },
      { name: "postgresjs", version: "v3.4.5" },
    ]);
  });
});
