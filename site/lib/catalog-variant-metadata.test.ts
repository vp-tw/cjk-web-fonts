import { describe, expect, test } from "vitest";

import { fonts } from "./catalog";

describe("variant classifications", () => {
  test("distinguishes LXGW WenKai proportional and monospaced variants", () => {
    const font = fonts.find((candidate) => candidate.id === "lxgw-wenkai-tc");
    expect(font?.variants.find((variant) => variant.id === "regular")?.classifications).toEqual([
      "handwriting",
    ]);
    expect(
      font?.variants.find((variant) => variant.id === "mono-regular")?.classifications,
    ).toEqual(["handwriting", "monospace"]);
  });

  test("distinguishes Fusion Pixel proportional and monospaced variants", () => {
    const font = fonts.find((candidate) => candidate.id === "fusion-pixel-font");
    expect(
      font?.variants.find((variant) => variant.id === "8px-proportional")?.classifications,
    ).toEqual(["display"]);
    expect(
      font?.variants.find((variant) => variant.id === "8px-monospaced")?.classifications,
    ).toEqual(["display", "monospace"]);
  });
});
