const hexColorPattern = /^#[\da-f]{6}$/iu;

function relativeLuminance(color: string): number {
  if (!hexColorPattern.test(color)) throw new TypeError(`Invalid hex color: ${color}`);
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255,
  );
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastCompliance(ratio: number): { normalText: boolean; largeText: boolean } {
  return { normalText: ratio >= 4.5, largeText: ratio >= 3 };
}
