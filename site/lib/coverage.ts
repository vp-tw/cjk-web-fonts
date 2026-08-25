import type { FontRecord, Range } from "./catalog";

const ignoredCodePoints = new Set([
  0x0009, 0x000a, 0x000d, 0x0020, 0x00a0, 0x200b, 0x200c, 0x200d, 0x2060, 0xfeff,
]);

export function uniqueRequiredCodePoints(text: string): number[] {
  return [
    ...new Set(
      Array.from(text, (character) => character.codePointAt(0)!).filter(
        (point) =>
          !ignoredCodePoints.has(point) &&
          !(point >= 0xfe00 && point <= 0xfe0f) &&
          !(point >= 0xe0100 && point <= 0xe01ef),
      ),
    ),
  ];
}

export function rangeContains(ranges: Range[], point: number): boolean {
  let low = 0;
  let high = ranges.length - 1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    const [start, end] = ranges[middle];
    if (point < start) high = middle - 1;
    else if (point > end) low = middle + 1;
    else return true;
  }
  return false;
}

export function missingForFont(font: FontRecord, text: string): number[] {
  const required = uniqueRequiredCodePoints(text);
  return missingRequiredCodePoints(font, required);
}

export function missingRequiredCodePoints(font: FontRecord, required: number[]): number[] {
  return required.filter(
    (point) => !font.variants.some((variant) => rangeContains(variant.coverage, point)),
  );
}

export function missingForFonts(fonts: FontRecord[], text: string): Record<string, number[]> {
  const required = uniqueRequiredCodePoints(text);
  return Object.fromEntries(
    fonts.map((font) => [font.id, missingRequiredCodePoints(font, required)]),
  );
}

export function formatCodePoint(point: number): string {
  return `U+${point.toString(16).toUpperCase().padStart(4, "0")}`;
}
