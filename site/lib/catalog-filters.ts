import type { CatalogFontRecord, WritingSystemId } from "./catalog";

export interface CatalogFilters {
  types: readonly CatalogTypeFilter[];
  languages: readonly string[];
  writingSystems: readonly WritingSystemId[];
}

export type CatalogTypeFilter =
  | "serif"
  | "sans-serif"
  | "handwriting"
  | "monospace"
  | "symbols"
  | "diagnostic";

export function matchingVariantIds(font: CatalogFontRecord, filters: CatalogFilters): string[] {
  if (!filters.languages.every((language) => font.languages.includes(language))) return [];

  const diagnosticSelected = filters.types.includes("diagnostic");
  const classifications = filters.types.filter((type) => type !== "diagnostic");
  return font.variants
    .filter((variant) => {
      const matchesType =
        filters.types.length === 0 ||
        (diagnosticSelected && font.roles.includes("diagnostic")) ||
        classifications.some((type) => variant.classifications.includes(type));
      const matchesWritingSystems = filters.writingSystems.every(
        (writingSystem) => variant.writingSystems[writingSystem] === "complete",
      );
      return matchesType && matchesWritingSystems;
    })
    .map((variant) => variant.id);
}

export function fontMatchesFilters(font: CatalogFontRecord, filters: CatalogFilters): boolean {
  return matchingVariantIds(font, filters).length > 0;
}
