import { describe, expect, it } from "vitest";

import { detectLocale, localeNames, localePath, locales, messages } from "./i18n";

describe("locale routing", () => {
  it("keeps English at the root and uses static subdirectories for other locales", () => {
    expect(localePath("en", "/cjk-web-fonts/")).toBe("/cjk-web-fonts/");
    expect(localePath("zh-Hant", "/cjk-web-fonts/")).toBe("/cjk-web-fonts/zh-hant/");
  });

  it("uses the established 正體中文 label for zh-Hant", () => {
    expect(localeNames["zh-Hant"]).toBe("正體中文");
  });

  it.each([
    [["zh-TW"], "zh-Hant"],
    [["zh-HK"], "zh-Hant"],
    [["zh-CN"], "zh-Hans"],
    [["ja-JP"], "ja"],
    [["ko-KR"], "ko"],
    [["fr-FR"], "en"],
    [["fr-FR", "ja"], "ja"],
  ] as const)("detects %j as %s", (languages, expected) => {
    expect(detectLocale(languages)).toBe(expected);
  });
});

describe("translation catalog", () => {
  it("contains a complete catalog for every supported locale", () => {
    const shape = (value: unknown): unknown =>
      typeof value === "object" && value !== null
        ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, shape(child)]))
        : typeof value;

    const englishShape = shape(messages.en);
    for (const locale of locales) expect(shape(messages[locale])).toEqual(englishShape);
  });
});
