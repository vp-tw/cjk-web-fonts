import type { CatalogFontRecord } from "./catalog";

export interface CatalogFontFamily {
  id: string;
  label: string;
  officialNames: Record<string, string>;
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
      officialNames: font.family?.officialNames ?? font.officialNames,
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

export function officialNameForLocale(
  family: CatalogFontFamily,
  locale: string,
): { locale: string; name: string } | null {
  const officialName =
    Object.entries(family.officialNames).find(
      ([nameLocale, name]) => nameLocale === locale && name !== family.label,
    ) ?? Object.entries(family.officialNames).find(([, name]) => name !== family.label);
  return officialName ? { locale: officialName[0], name: officialName[1] } : null;
}
