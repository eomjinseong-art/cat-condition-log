export const CAT_PALETTE = [
  { hex: "#c45c26", soft: "#f6e0d2" },
  { hex: "#4f7a63", soft: "#dce8e0" },
  { hex: "#5b7c99", soft: "#d9e4ee" },
  { hex: "#c4922a", soft: "#f6e7c8" },
  { hex: "#9a5b7c", soft: "#eddce6" },
  { hex: "#6b5e50", soft: "#e8e0d6" },
] as const;

export function catColorIndex(catId: string, orderedIds: string[]) {
  const index = orderedIds.indexOf(catId);
  return (index < 0 ? 0 : index) % CAT_PALETTE.length;
}

export function catColor(catId: string, orderedIds: string[]) {
  return CAT_PALETTE[catColorIndex(catId, orderedIds)];
}

export function catInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1) : "냥";
}

export function catIdsByDay(logs: Array<{ loggedOn: string; catId: string }>) {
  const map = new Map<string, string[]>();
  for (const log of logs) {
    const list = map.get(log.loggedOn) ?? [];
    if (!list.includes(log.catId)) list.push(log.catId);
    map.set(log.loggedOn, list);
  }
  return map;
}
