import { describe, expect, test } from "vitest";

import { contrastCompliance, contrastRatio } from "./color-contrast";

describe("contrastRatio", () => {
  test("matches WCAG reference endpoints", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
  });

  test("measures the documented preview defaults", () => {
    expect(contrastRatio("#171816", "#e7e3d8")).toBeCloseTo(13.894, 3);
  });

  test("rejects values outside the color-input contract", () => {
    expect(() => contrastRatio("black", "#ffffff")).toThrow(TypeError);
  });
});

describe("contrastCompliance", () => {
  test.each([
    [4.5, true, true],
    [3, false, true],
    [2.99, false, false],
  ])("classifies %s:1", (ratio, normalText, largeText) => {
    expect(contrastCompliance(ratio)).toEqual({ normalText, largeText });
  });
});
