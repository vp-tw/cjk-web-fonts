import { describe, expect, it } from "vitest";

import type { CatalogFontVariant } from "./catalog";
import { fontFamilyCss, fontFamilyValue, genericFamilyFor } from "./font-usage";

function variant(classifications: string[], families = ["Example"]): CatalogFontVariant {
  return { classifications, families } as CatalogFontVariant;
}

describe("font usage", () => {
  it.each([
    [["serif"], "serif"],
    [["sans-serif"], "sans-serif"],
    [["display", "monospace"], "monospace"],
    [["handwriting"], "cursive"],
    [["display"], "sans-serif"],
  ])("maps %j to its CSS generic family", (classifications, expected) => {
    expect(genericFamilyFor(variant(classifications))).toBe(expected);
  });

  it("deduplicates web families and appends the generic fallback", () => {
    expect(fontFamilyValue(variant(["serif"], ["HanaMin", "HanaMin"]))).toBe('"HanaMin", serif');
  });

  it("formats a copyable CSS declaration", () => {
    expect(fontFamilyCss(variant(["monospace"], ["Fusion Pixel"]))).toBe(
      '.your-selector {\n  font-family: "Fusion Pixel", monospace;\n}',
    );
  });
});
