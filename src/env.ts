const DEFAULT_CONFIG_FILE: string = `${Deno.cwd()}/audit.json`;
const DEFAULT_OUTPUT_DIR: string = `${Deno.cwd()}/.audit`;

/** Environment variables. */
export const Env: {
  /** Configuration file path (default: `audit.json`). */
  CONFIG_FILE: string;
  /** Output directory path (default: `.audit`). */
  OUTPUT_DIR: string;
  /** Token for authenticated GitHub API requests. */
  GITHUB_TOKEN?: string;
} = {
  CONFIG_FILE: Deno.env.get("CONFIG_FILE") ?? DEFAULT_CONFIG_FILE,
  OUTPUT_DIR: Deno.env.get("OUTPUT_DIR") ?? DEFAULT_OUTPUT_DIR,
  GITHUB_TOKEN: Deno.env.get("GITHUB_TOKEN"),
};
