import { audit, type AuditOptions, runAudit } from "./src/audit.ts";
import { Env } from "./src/env.ts";

if (import.meta.main) {
  runAudit();
}

export { audit, type AuditOptions, Env, runAudit };
