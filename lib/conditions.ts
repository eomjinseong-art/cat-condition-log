export const CAT_CONDITIONS = ["CKD", "HYPERTHYROID", "HYPERTENSION", "ARTHRITIS"] as const;

export type CatCondition = (typeof CAT_CONDITIONS)[number];

export const conditionLabels: Record<CatCondition, string> = {
  CKD: "만성신장병(CKD)",
  HYPERTHYROID: "갑상선기능항진",
  HYPERTENSION: "고혈압",
  ARTHRITIS: "관절염",
};

export function parseConditions(values: unknown): CatCondition[] {
  if (!Array.isArray(values)) return [];
  const allowed = new Set<string>(CAT_CONDITIONS);
  const seen = new Set<CatCondition>();
  for (const value of values) {
    if (typeof value === "string" && allowed.has(value) && !seen.has(value as CatCondition)) {
      seen.add(value as CatCondition);
    }
  }
  return [...seen];
}

export function hasCondition(conditions: readonly string[] | null | undefined, key: CatCondition) {
  return Boolean(conditions?.includes(key));
}
