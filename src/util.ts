import type { OutOptions, Package, Severity } from "./types.ts";

export const OUT_DIR = `${Deno.cwd()}/.audit`;
export const fallback = "N/A";

export const createOutDir = (options?: OutOptions): void => {
  const dir = options?.dir ?? OUT_DIR;

  try {
    Deno.removeSync(dir, { recursive: true });
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  Deno.mkdirSync(dir);
};

export const writeFileToOutDir = (
  name: string,
  text: string,
  options?: OutOptions,
) => {
  const dir = options?.dir ?? OUT_DIR;

  Deno.writeTextFileSync(`${dir}/${name}`, text);
};

export const deduplicate = (a: Package[]): Package[] => {
  return a.filter((o, index, arr) =>
    arr.findIndex((item) => JSON.stringify(item) === JSON.stringify(o)) ===
      index
  );
};

export const inferSeverities = (severity: Severity): Severity[] => {
  if (severity === "critical") return ["critical"];
  if (severity === "high") return ["high", "critical"];
  if (severity === "moderate") return ["moderate", "high", "critical"];
  return ["low", "moderate", "high", "critical"];
};
