import { CSS, render } from "@deno/gfm";
import type { PkgResolved } from "./types.ts";
import { Env } from "./env.ts";

/** @internal */
export type Config = {
  ignore?: {
    [key: string]: string[];
  };
};

/** @internal */
export const File = {
  clearOutputDir: () => {
    try {
      Deno.removeSync(Env.OUTPUT_DIR, { recursive: true });
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        throw err;
      }
    }
  },
  createOutputDir: () => {
    try {
      Deno.mkdirSync(Env.OUTPUT_DIR);
    } catch (err) {
      if (!(err instanceof Deno.errors.AlreadyExists)) {
        throw err;
      }
    }
  },
  readConfig: (): Config => {
    try {
      return JSON.parse(Deno.readTextFileSync(Env.CONFIG_FILE)) as Config;
    } catch {
      return {};
    }
  },
  writePackages: (pkgs: PkgResolved[]): void => {
    File.createOutputDir();
    Deno.writeTextFileSync(
      `${Env.OUTPUT_DIR}/resolved-packages.json`,
      JSON.stringify(
        pkgs.map((pkg) => ({
          origin: pkg.origin,
          name: pkg.name,
          version: pkg.version,
          owner: pkg.owner,
          repo: pkg.repo,
        })),
        null,
        2,
      ),
    );
  },
  writeUnresolvedPackage: (pkg: string): void => {
    File.createOutputDir();
    Deno.writeTextFileSync(
      `${Env.OUTPUT_DIR}/unresolved-packages.txt`,
      `${pkg}\n`,
      {
        append: true,
      },
    );
  },
  writeReport: (data: string): void => {
    File.createOutputDir();
    Deno.writeTextFileSync(`${Env.OUTPUT_DIR}/report.md`, data, {
      append: true,
    });
  },
  readHtmlReport: (): Uint8Array<ArrayBuffer> | null => {
    try {
      return Deno.readFileSync(`${Env.OUTPUT_DIR}/report.html`);
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        throw err;
      }
      console.info(`No audit report found at ${Env.OUTPUT_DIR}/report.html`);
      return null;
    }
  },
  writeHtmlReport: (): void => {
    File.createOutputDir();

    try {
      const auditMd = Deno.readTextFileSync(`${Env.OUTPUT_DIR}/report.md`);

      Deno.writeTextFileSync(
        `${Env.OUTPUT_DIR}/report.html`,
        `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      main {
        max-width: 800px;
        margin: 0 auto;
      }
      ${CSS}
    </style>
  </head>
  <body data-color-mode="auto" data-light-theme="light" data-dark-theme="dark" class="markdown-body">
    <main>
      ${render(auditMd)}
    </main>
  </body>
</html>
      `,
      );
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) throw err;
      console.info(`No audit report found at ${Env.OUTPUT_DIR}/report.md`);
    }
  },
};
