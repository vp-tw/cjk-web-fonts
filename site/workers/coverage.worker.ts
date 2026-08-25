import catalog from "../generated/fonts.json";
import { missingForFonts } from "../lib/coverage";
import type { FontRecord } from "../lib/catalog";

type CoverageRequest = { requestId: number; text: string };

export type CoverageResponse = {
  requestId: number;
  results: Record<string, number[]>;
};

const fonts = catalog.fonts as unknown as FontRecord[];

self.onmessage = (event: MessageEvent<CoverageRequest>) => {
  self.postMessage({
    requestId: event.data.requestId,
    results: missingForFonts(fonts, event.data.text),
  } satisfies CoverageResponse);
};
