import { CSS, render } from "@deno/gfm";

/** @internal*/
export const File = {
  writePackageJson: (outputDir: string, data: string) => {
    Deno.writeTextFileSync(`${outputDir}/package.json`, data);
  },
  writeReport: (outputDir: string, data: string) => {
    Deno.writeTextFileSync(`${outputDir}/report.md`, data, { append: true });
  },
  writeReportHtml: (outputDir: string, data: string) => {
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
  <body>
    <main data-color-mode="light" data-light-theme="light" data-dark-theme="dark" class="markdown-body">
      ${render(data)}
    </main>
  </body>
</html>
    `,
      { append: true },
    );
  },
};
