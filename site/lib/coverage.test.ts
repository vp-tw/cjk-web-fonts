import { describe, expect, it } from "vitest";

import { rangeContains, uniqueRequiredCodePoints } from "./coverage";

describe("coverage", () => {
  it("deduplicates Unicode scalar values and ignores layout whitespace", () => {
    expect(uniqueRequiredCodePoints("字 字\n體")).toEqual([0x5b57, 0x9ad4]);
  });

  it("preserves supplementary-plane characters", () => {
    expect(uniqueRequiredCodePoints("𠮷")).toEqual([0x20bb7]);
  });

  it("leaves variation selectors to the sequence audit", () => {
    expect(uniqueRequiredCodePoints("葛󠄀")).toEqual([0x845b]);
  });

  it("finds points with a binary range search", () => {
    const ranges: [number, number][] = [
      [0x20, 0x7e],
      [0x4e00, 0x9fff],
    ];
    expect(rangeContains(ranges, 0x5b57)).toBe(true);
    expect(rangeContains(ranges, 0x3400)).toBe(false);
  });
});
