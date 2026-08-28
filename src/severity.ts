/** @internal */
export const severities = ["low", "moderate", "high", "critical"] as const;

/** @internal */
export type Severity = typeof severities[number];

/** @internal */
export const inferSeverities = (severity: Severity): Severity[] => {
  if (severity === "critical") return ["critical"];
  if (severity === "high") return ["high", "critical"];
  if (severity === "moderate") return ["moderate", "high", "critical"];
  return ["low", "moderate", "high", "critical"];
};
