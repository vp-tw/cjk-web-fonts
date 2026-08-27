import catalog from "../generated/fonts.json";

export type Range = [number, number];

export interface Cdn {
  id: string;
  label: string;
  baseUrl: string;
  note: string;
}

export interface FontVariant {
  id: string;
  label: string;
  classifications: string[];
  families: string[];
  weight: number;
  style: string;
  stretch: string;
  cssPath: string;
  urls: Record<string, string>;
  coverage: Range[];
  characterCount: number;
  writingSystems: Record<WritingSystemId, CoverageLevel>;
}

export type CoverageLevel = "complete" | "partial" | "none";
export type WritingSystemId =
  | "latin"
  | "bopomofo"
  | "hiragana"
  | "katakana"
  | "han"
  | "hangul"
  | "symbols";

export interface FontFamilyMembership {
  id: string;
  label: string;
  axisLabel: string;
  value: string;
  valueLabel: string;
  order: number;
  default: boolean;
}

export interface FontRecord {
  id: string;
  label: string;
  packageName: string;
  version: string;
  description: string;
  license: string;
  sourceUrl: string;
  repositoryUrl: string;
  classifications: string[];
  roles: string[];
  languages: string[];
  diagnosticType: string | null;
  family: FontFamilyMembership | null;
  variants: FontVariant[];
}

export type CatalogFontVariant = Omit<FontVariant, "coverage">;
export type CatalogFontRecord = Omit<FontRecord, "variants"> & {
  variants: CatalogFontVariant[];
};

export const cdns = catalog.cdns as Cdn[];
export const writingSystems = catalog.writingSystems as WritingSystemId[];
export const fonts = catalog.fonts as unknown as FontRecord[];
export const catalogFonts: CatalogFontRecord[] = fonts.map((font) => ({
  ...font,
  variants: font.variants.map(({ coverage: _coverage, ...variant }) => variant),
}));
