import { CSS, render } from "@deno/gfm";

/** @internal */
export const File = {
  writePackageJson: (outputDir: string, data: string): void => {
    Deno.writeTextFileSync(`${outputDir}/package.json`, data);
  },
  writeReport: (outputDir: string, data: string): void => {
    Deno.writeTextFileSync(`${outputDir}/report.md`, data, { append: true });
  },
  generateHtmlReport: (outputDir: string): void => {
    try {
      const auditMd = Deno.readTextFileSync(`${outputDir}/report.md`);

      Deno.writeTextFileSync(
        `${outputDir}/report.html`,
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
      console.info(`No audit report found at ${outputDir}/report.md`);
    }
  },
};
