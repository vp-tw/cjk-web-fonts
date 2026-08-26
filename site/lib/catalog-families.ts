import type { CatalogFontRecord } from "./catalog";

export interface CatalogFontFamily {
  id: string;
  label: string;
  axisLabel: string | null;
  fonts: CatalogFontRecord[];
  defaultFontId: string;
}

export function groupCatalogFonts(records: CatalogFontRecord[]): CatalogFontFamily[] {
  const groups = new Map<string, CatalogFontFamily>();
  for (const font of records) {
    const familyId = font.family?.id ?? font.id;
    const existing = groups.get(familyId);
    if (existing) {
      existing.fonts.push(font);
      if (font.family?.default) existing.defaultFontId = font.id;
      continue;
    }
    groups.set(familyId, {
      id: familyId,
      label: font.family?.label ?? font.label,
      axisLabel: font.family?.axisLabel ?? null,
      fonts: [font],
      defaultFontId: font.id,
    });
  }
  return [...groups.values()].map((group) => ({
    ...group,
    fonts: group.fonts.toSorted(
      (left, right) => (left.family?.order ?? 0) - (right.family?.order ?? 0),
    ),
  }));
}
