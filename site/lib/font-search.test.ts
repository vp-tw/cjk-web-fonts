import { describe, expect, it } from "vitest";

import type { CatalogFontRecord } from "./catalog";
import { groupCatalogFonts } from "./catalog-families";
import { searchFontFamilies } from "./font-search";

function font(
  id: string,
  label: string,
  officialNames: Record<string, string>,
  description = "",
): CatalogFontRecord {
  return {
    id,
    label,
    officialNames,
    description,
    packageName: `@vp-tw/cjk-web-fonts-${id}`,
    classifications: ["sans-serif"],
    languages: ["zh_Hant"],
    roles: ["text"],
    family: null,
    variants: [{ classifications: ["sans-serif"] }],
  } as CatalogFontRecord;
}

const families = groupCatalogFonts([
  font("iansui", "Iansui", { en: "Iansui", "zh-Hant": "芫荽" }, "Education font"),
  font("taipei-sans-tc", "Taipei Sans TC", {
    en: "Taipei Sans TC",
    "zh-Hant": "台北黑體",
  }),
  font("jigmo", "Jigmo", { en: "Jigmo", ja: "字雲" }, "Rare ideographs"),
]);

describe("searchFontFamilies", () => {
  it("returns every family in registry order for an empty query", () => {
    expect(searchFontFamilies(families, "").map((family) => family.id)).toEqual([
      "iansui",
      "taipei-sans-tc",
      "jigmo",
    ]);
  });

  it("searches localized official names", () => {
    expect(searchFontFamilies(families, "芫荽").map((family) => family.id)).toEqual(["iansui"]);
  });

  it("tolerates a typo in a catalog name", () => {
    expect(searchFontFamilies(families, "Taipie Sans").map((family) => family.id)).toEqual([
      "taipei-sans-tc",
    ]);
  });

  it("ranks names ahead of weak metadata matches", () => {
    expect(searchFontFamilies(families, "Jigmo")[0].id).toBe("jigmo");
  });
});
