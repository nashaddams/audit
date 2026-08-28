import type { Severity } from "./types.ts";

const runCommand = (
  command: string,
  args?: string[],
): { code: number; stdout: string; stderr: string } => {
  const { code, stdout, stderr } = new Deno.Command(command, {
    args,
    stdout: "piped",
    stderr: "piped",
  }).outputSync();

  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
};

/** @internal */
export const Cmd = {
  npmInstall: ({ outputDir }: { outputDir: string }): { stderr: string } => {
    const { stderr } = runCommand("npm", [
      "install",
      "--prefix",
      outputDir,
      "--package-lock-only",
    ]);

    return { stderr };
  },
  npmAudit: (
    { outputDir, severity }: { outputDir: string; severity: Severity },
  ): { code: number; stdout: string; stderr: string } => {
    const { code, stdout, stderr } = runCommand("npm", [
      "audit",
      "--prefix",
      outputDir,
      "--audit-level",
      severity,
      "--json",
    ]);

    return { code, stdout, stderr };
  },
};
