/** @internal */
export const severities = ["low", "medium", "high", "critical"] as const;

/** @internal */
export type Severity = typeof severities[number];

/** @internal */
export const inferSeverities = (severity: Severity): Severity[] => {
  if (severity === "critical") return ["critical"];
  if (severity === "high") return ["high", "critical"];
  if (severity === "medium") return ["medium", "high", "critical"];
  return ["low", "medium", "high", "critical"];
};
