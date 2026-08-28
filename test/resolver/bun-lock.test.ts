import { assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import BunLockResolver from "../../src/resolver/bun-lock.ts";

describe("[resolver] bun-lock", () => {
  let tmpLockFile: string | undefined = undefined;

  beforeEach(() => {
    tmpLockFile = Deno.makeTempFileSync();
  });

  afterEach(() => {
    Deno.removeSync(tmpLockFile!);
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

    const extracted = BunLockResolver.extract(tmpLockFile!);
    const resolved = BunLockResolver.origins.npm.normalize(extracted.npm);

    assertEquals(resolved, [
      { name: "@algolia/autocomplete-core", version: "1.17.7" },
      { name: "accepts", version: "1.3.8" },
      { name: "@shikijs/transformers", version: "2.5.0" },
    ]);
  });
});
