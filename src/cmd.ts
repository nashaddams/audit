import type { Severity } from "./types.ts";
import { OUT_DIR } from "./util.ts";

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

export const Cmd = {
  npmInstall: (): { stderr: string } => {
    const { stderr } = runCommand("npm", [
      "install",
      "--prefix",
      OUT_DIR,
      "--package-lock-only",
      "--silent",
    ]);

    return { stderr };
  },
  npmAudit: (
    { severity }: { severity: Severity },
  ): { code: number; stdout: string; stderr: string } => {
    const { code, stdout, stderr } = runCommand("npm", [
      "audit",
      "--prefix",
      OUT_DIR,
      "--audit-level",
      severity,
      "--json",
    ]);

    return { code, stdout, stderr };
  },
};
