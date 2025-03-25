import { assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { ResolverRegistry } from "../../src/resolver/mod.ts";
import { File } from "../../src/file.ts";

describe("[resolver] bun-lock", () => {
  let tmpLockFile: string | undefined = undefined;

  beforeEach(() => {
    tmpLockFile = Deno.makeTempFileSync();
  });

  afterEach(() => {
    Deno.removeSync(tmpLockFile!);
    File.clearOutputDir();
  });

  it("should normalize packages", () => {
    Deno.writeTextFileSync(
      tmpLockFile!,
      JSON.stringify({
        packages: {
          "@algolia/autocomplete-core": ["@algolia/autocomplete-core@1.17.7"],
          "accepts": ["accepts@1.3.8"],
          "@shikijs/transformers": ["@shikijs/transformers@2.5.0"],
        },
      }),
    );

    const extracted = ResolverRegistry["bun-lock"].extract(tmpLockFile!);
    const resolved = ResolverRegistry["bun-lock"].origins.npm.normalize(
      extracted.npm,
    );

    assertEquals(resolved, [
      { name: "@algolia/autocomplete-core", version: "1.17.7" },
      { name: "accepts", version: "1.3.8" },
      { name: "@shikijs/transformers", version: "2.5.0" },
    ]);
  });
});
