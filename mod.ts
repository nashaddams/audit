import { audit, runAudit } from "./src/audit.ts";

if (import.meta.main) {
  runAudit();
}

export { audit };
export default audit;
