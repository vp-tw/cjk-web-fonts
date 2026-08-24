import { missingForFont } from "../lib/coverage";
import type { FontRecord } from "../lib/catalog";

self.onmessage = (event: MessageEvent<{ fonts: FontRecord[]; text: string }>) => {
  const results = Object.fromEntries(
    event.data.fonts.map((font) => [font.id, missingForFont(font, event.data.text)]),
  );
  self.postMessage(results);
};
