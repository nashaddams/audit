import { assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { ResolverRegistry } from "../../src/resolver/mod.ts";
import { File } from "../../src/file.ts";

describe("[resolver] package-lock", () => {
  let tmpLockFile: string | undefined = undefined;

  beforeEach(() => {
    tmpLockFile = Deno.makeTempFileSync();
  });

  afterEach(() => {
    Deno.removeSync(tmpLockFile!);
    File.clearOutputDir();
  });

  it("should normalize packages and sub-packages", () => {
    Deno.writeTextFileSync(
      tmpLockFile!,
      JSON.stringify({
        packages: {
          "node_modules/axios": {
            "version": "1.8.3",
          },
          "node_modules/birpc": {
            "version": "0.2.19",
          },
          "node_modules/send": {
            "version": "0.19.0",
          },
          "node_modules/send/node_modules/encodeurl": {
            "version": "1.0.2",
          },
          "node_modules/encodeurl": {
            "version": "2.0.0",
          },
          "node_modules/@rollup/rollup-android-arm-eabi": {
            "version": "4.35.0",
          },
        },
      }),
    );

    const extracted = ResolverRegistry["package-lock"].extract(tmpLockFile!);
    const resolved = ResolverRegistry["package-lock"].origins.npm.normalize(
      extracted.npm,
    );

    assertEquals(resolved, [
      { name: "axios", version: "1.8.3" },
      { name: "birpc", version: "0.2.19" },
      { name: "send", version: "0.19.0" },
      { name: "encodeurl", version: "1.0.2" },
      { name: "encodeurl", version: "2.0.0" },
      { name: "@rollup/rollup-android-arm-eabi", version: "4.35.0" },
    ]);
  });
});
