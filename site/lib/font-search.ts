import Fuse from "fuse.js/basic";

import type { CatalogFontFamily } from "./catalog-families";

interface SearchDocument {
  family: CatalogFontFamily;
  label: string;
  officialNames: string[];
  fontLabels: string[];
  packageNames: string[];
  descriptions: string[];
  traits: string[];
}

function searchDocuments(families: readonly CatalogFontFamily[]): SearchDocument[] {
  return families.map((family) => ({
    family,
    label: family.label,
    officialNames: Object.values(family.officialNames),
    fontLabels: family.fonts.map((font) => font.label),
    packageNames: family.fonts.map((font) => font.packageName),
    descriptions: family.fonts.map((font) => font.description),
    traits: family.fonts.flatMap((font) => [
      ...font.classifications,
      ...font.languages,
      ...font.variants.flatMap((variant) => variant.classifications),
    ]),
  }));
}

export function searchFontFamilies(
  families: readonly CatalogFontFamily[],
  query: string,
): CatalogFontFamily[] {
  const needle = query.trim();
  if (!needle) return [...families];

  const fuse = new Fuse(searchDocuments(families), {
    ignoreDiacritics: true,
    ignoreLocation: true,
    threshold: 0.35,
    keys: [
      { name: "officialNames", weight: 0.34 },
      { name: "label", weight: 0.3 },
      { name: "fontLabels", weight: 0.16 },
      { name: "packageNames", weight: 0.1 },
      { name: "traits", weight: 0.06 },
      { name: "descriptions", weight: 0.04 },
    ],
  });

  return fuse.search(needle).map((result) => result.item.family);
}
