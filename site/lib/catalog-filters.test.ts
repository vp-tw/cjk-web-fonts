import { describe, expect, test } from "vitest";
import {
  catalogFonts,
  type CatalogFontRecord,
  type CatalogFontVariant,
  type WritingSystemId,
} from "./catalog";
import {
  fontMatchesFilters,
  matchingVariantIds,
  preferredMatchingVariantId,
} from "./catalog-filters";

const systems = (complete: WritingSystemId[]): CatalogFontVariant["writingSystems"] =>
  Object.fromEntries(
    ["latin", "bopomofo", "hiragana", "katakana", "han", "hangul", "symbols"].map((id) => [
      id,
      complete.includes(id as WritingSystemId) ? "complete" : "none",
    ]),
  ) as CatalogFontVariant["writingSystems"];
const variant = (
  id: string,
  classifications: string[],
  writingSystems: CatalogFontVariant["writingSystems"],
): CatalogFontVariant => ({
  id,
  label: id,
  classifications,
  families: ["Test"],
  weight: 400,
  style: "normal",
  stretch: "normal",
  cssPath: `dist/${id}.css`,
  urls: { jsdelivr: `https://example.com/${id}.css` },
  characterCount: 1,
  writingSystems,
});
const font: CatalogFontRecord = {
  id: "test",
  label: "Test",
  officialNames: { en: "Test" },
  packageName: "@example/test",
  version: "0.0.1",
  description: "Test font",
  license: "OFL-1.1",
  sourceUrl: "https://example.com/source",
  repositoryUrl: "https://example.com/repository",
  classifications: ["handwriting", "monospace"],
  roles: ["text"],
  languages: ["en_Latn", "zh_Hant"],
  diagnosticType: null,
  family: null,
  variants: [
    variant("regular", ["handwriting"], systems(["latin", "bopomofo"])),
    variant("mono", ["handwriting", "monospace"], systems(["latin", "bopomofo", "symbols"])),
  ],
};

describe("matchingVariantIds", () => {
  test("treats empty facets as unconstrained", () => {
    expect(matchingVariantIds(font, { types: [], languages: [], writingSystems: [] })).toEqual([
      "regular",
      "mono",
    ]);
  });
  test("uses OR for font types", () => {
    expect(
      matchingVariantIds(font, {
        types: ["serif", "monospace"],
        languages: [],
        writingSystems: [],
      }),
    ).toEqual(["mono"]);
  });
  test("uses AND for language and writing-system support", () => {
    expect(
      matchingVariantIds(font, {
        types: [],
        languages: ["en_Latn", "zh_Hant"],
        writingSystems: ["bopomofo", "symbols"],
      }),
    ).toEqual(["mono"]);
    expect(
      matchingVariantIds(font, {
        types: [],
        languages: ["en_Latn", "ja_Jpan"],
        writingSystems: [],
      }),
    ).toEqual([]);
  });
  test("requires type and writing-system conditions on the same variant", () => {
    expect(
      matchingVariantIds(font, {
        types: ["monospace"],
        languages: ["zh_Hant"],
        writingSystems: ["symbols"],
      }),
    ).toEqual(["mono"]);
  });
  test("keeps the diagnostic role separate from classifications", () => {
    expect(
      fontMatchesFilters(font, { types: ["diagnostic"], languages: [], writingSystems: [] }),
    ).toBe(false);
  });

  test.each(["lxgw-wenkai-tc", "fusion-pixel-font"])(
    "%s exposes only its monospaced variants for a monospace filter",
    (fontId) => {
      const catalogFont = catalogFonts.find((candidate) => candidate.id === fontId);
      expect(catalogFont).toBeDefined();
      const ids = matchingVariantIds(catalogFont!, {
        types: ["monospace"],
        languages: [],
        writingSystems: [],
      });
      expect(ids.length).toBeGreaterThan(0);
      expect(
        ids.every((id) =>
          catalogFont!.variants
            .find((variant) => variant.id === id)
            ?.classifications.includes("monospace"),
        ),
      ).toBe(true);
      expect(ids).not.toContain(
        catalogFont!.variants.find((variant) => !variant.classifications.includes("monospace"))?.id,
      );
      if (fontId === "lxgw-wenkai-tc") {
        expect(preferredMatchingVariantId(catalogFont!, ids, 400)).toBe("mono-regular");
      }
    },
  );
});
