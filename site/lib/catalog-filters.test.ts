import { describe, expect, test } from "vitest";

import type { CatalogFontRecord } from "./catalog";
import { fontMatchesFilters } from "./catalog-filters";

const font = {
  classifications: ["sans-serif"],
  roles: ["text"],
  languages: ["zh_Hant"],
  variants: [{ writingSystems: { bopomofo: "complete", hangul: "partial" } }],
} as unknown as CatalogFontRecord;

describe("fontMatchesFilters", () => {
  test("combines category, reviewed language, and complete writing-system coverage", () => {
    expect(
      fontMatchesFilters(font, {
        category: "sans-serif",
        language: "zh_Hant",
        writingSystem: "bopomofo",
      }),
    ).toBe(true);
    expect(
      fontMatchesFilters(font, {
        category: "sans-serif",
        language: "zh_Hant",
        writingSystem: "hangul",
      }),
    ).toBe(false);
  });

  test("keeps the diagnostic role separate from Fontsource classifications", () => {
    expect(
      fontMatchesFilters(font, {
        category: "diagnostic",
        language: "all",
        writingSystem: "all",
      }),
    ).toBe(false);
  });
});
