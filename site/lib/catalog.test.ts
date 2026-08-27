import { describe, expect, it } from "vitest";

import { catalogFonts, type CatalogFontRecord } from "./catalog";
import {
  groupCatalogFonts,
  officialNameForLocale,
  type CatalogFontFamily,
} from "./catalog-families";

function font(id: string, family: CatalogFontRecord["family"] = null): CatalogFontRecord {
  return { id, label: id, family, variants: [] } as unknown as CatalogFontRecord;
}

describe("catalog families", () => {
  it("uses the registry's official Glow Sans order and default", () => {
    const glow = groupCatalogFonts(catalogFonts).find((family) => family.id === "glow-sans-tc");
    expect(glow?.fonts.map((entry) => entry.family?.value)).toEqual([
      "compressed",
      "condensed",
      "normal",
      "extended",
      "wide",
    ]);
    expect(glow?.defaultFontId).toBe("glow-sans-tc-normal");
  });

  it("keeps standalone packages as standalone specimens", () => {
    expect(groupCatalogFonts([font("jigmo")])).toMatchObject([
      { id: "jigmo", label: "jigmo", defaultFontId: "jigmo" },
    ]);
  });

  it("groups packages in official order and selects the declared default", () => {
    const membership = (value: string, order: number, isDefault = false) => ({
      id: "glow",
      label: "Glow",
      axisLabel: "字寬",
      value,
      valueLabel: value,
      order,
      default: isDefault,
    });
    const groups = groupCatalogFonts([
      font("wide", membership("wide", 4)),
      font("normal", membership("normal", 2, true)),
      font("compressed", membership("compressed", 0)),
    ]);

    expect(groups[0].fonts.map((entry) => entry.id)).toEqual(["compressed", "normal", "wide"]);
    expect(groups[0].defaultFontId).toBe("normal");
  });
});

describe("officialNameForLocale", () => {
  const family = {
    id: "jigmo",
    label: "Jigmo",
    officialNames: { en: "Jigmo", ja: "字雲" },
    axisLabel: null,
    fonts: [],
    defaultFontId: "jigmo",
  } satisfies CatalogFontFamily;

  it("uses a distinct name in the requested locale", () => {
    expect(officialNameForLocale(family, "ja")).toEqual({ locale: "ja", name: "字雲" });
  });

  it("falls back to a distinct upstream name instead of duplicating the label", () => {
    expect(officialNameForLocale(family, "zh-Hant")).toEqual({ locale: "ja", name: "字雲" });
  });
});
