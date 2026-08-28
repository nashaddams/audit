import { audit, type AuditOptions, runAudit } from "./src/audit.ts";

if (import.meta.main) {
  runAudit();
}

export { audit, type AuditOptions, runAudit };
