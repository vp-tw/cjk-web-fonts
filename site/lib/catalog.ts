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
  families: string[];
  weight: number;
  style: string;
  cssPath: string;
  urls: Record<string, string>;
  coverage: Range[];
  characterCount: number;
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
  variants: FontVariant[];
}

export const cdns = catalog.cdns as Cdn[];
export const fonts = catalog.fonts as unknown as FontRecord[];
