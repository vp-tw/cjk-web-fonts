import type { CatalogFontVariant } from "./catalog";

export type GenericFontFamily = "serif" | "sans-serif" | "monospace" | "cursive";

export function genericFamilyFor(variant: CatalogFontVariant): GenericFontFamily {
  if (variant.classifications.includes("monospace")) return "monospace";
  if (variant.classifications.includes("serif")) return "serif";
  if (variant.classifications.includes("handwriting")) return "cursive";
  return "sans-serif";
}

export function fontFamilyValue(
  variant: CatalogFontVariant,
  additionalFamilies: readonly string[] = [],
): string {
  const families = [...new Set([...variant.families, ...additionalFamilies])];
  return `${families.map((family) => JSON.stringify(family)).join(", ")}, ${genericFamilyFor(variant)}`;
}

export function fontFamilyCss(variant: CatalogFontVariant): string {
  return `.your-selector {\n  font-family: ${fontFamilyValue(variant)};\n}`;
}
