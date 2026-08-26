import type { CatalogFontRecord, WritingSystemId } from "./catalog";

export interface CatalogFilters {
  category: string;
  language: string;
  writingSystem: WritingSystemId | "all";
}

export function fontMatchesFilters(font: CatalogFontRecord, filters: CatalogFilters): boolean {
  const matchesCategory =
    filters.category === "all" ||
    (filters.category === "diagnostic"
      ? font.roles.includes("diagnostic")
      : font.classifications.includes(filters.category));
  const matchesLanguage = filters.language === "all" || font.languages.includes(filters.language);
  const writingSystem = filters.writingSystem;
  const matchesWritingSystem =
    writingSystem === "all" ||
    font.variants.some((variant) => variant.writingSystems[writingSystem] === "complete");
  return matchesCategory && matchesLanguage && matchesWritingSystem;
}
