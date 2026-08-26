export const proofPresets = [
  {
    id: "latin",
    label: "拉丁文",
    text: "ABC xyz 0123456789 · À bientôt, Ångström — façade, œuvre, Straße, İı Œœ Ææ.",
  },
  {
    id: "symbols",
    label: "符號",
    text: "!? … — () [] {} 〈〉《》「」『』 ＡＢＣ１２３ ％ ＋ − × ÷ ☀︎ ★ ↔︎ → ← ↑ ↓ © ® ™ € ¥ ₩ ✓ ✕",
  },
  {
    id: "bopomofo",
    label: "注音",
    text: "ㄅㄆㄇㄈ：ㄓㄨˋ ㄧㄣ ㄈㄨˊ ㄏㄠˋ，ㄊㄞˊ ㄨㄢ ㄏㄨㄚˋ。",
  },
  {
    id: "japanese",
    label: "日文",
    text: "日本語：東京で珈琲を飲み、ひらがな・カタカナ・漢字を比べる。ヴァイオリン、ヷヸヹヺ。",
  },
  {
    id: "korean",
    label: "韓文",
    text: "한국어: 서울의 봄날, 한글과 漢字를 함께 살펴봅니다. 훈민정음 옛한글 ㆍㆆㆁㆄ.",
  },
  {
    id: "cantonese",
    label: "粵語",
    text: "粵語：佢喺邊度？唔該畀杯凍檸茶我，𠺢𠹌啲字都要試。冇乜嘢，噉樣至啱。",
  },
  {
    id: "traditional",
    label: "正體",
    text: "正體：臺灣製造、雙層公寓、躍過鬱鬱蔥蔥的山巒；著作權與資訊網絡。",
  },
  {
    id: "simplified",
    label: "簡體",
    text: "简体：汉字转换、后发优势、云端数据库与软件测试；重庆面馆里话儿化。",
  },
  {
    id: "rare",
    label: "罕見字",
    text: "特殊與罕見：𠮷 𡘙 𪚥 𫝀 𫠜 𬺰 𰻞 龘 䨻 葛󠄀 邊󠄀 辻󠄀",
  },
] as const;

export type ProofPresetId = (typeof proofPresets)[number]["id"];

export type ProofPresetSelection =
  | { mode: "all" }
  | { mode: "selected"; ids: ProofPresetId[] }
  | { mode: "custom" };

export function composeProofText(ids: readonly ProofPresetId[]): string {
  const selected = new Set(ids);
  return proofPresets
    .filter((preset) => selected.has(preset.id))
    .map((preset) => preset.text)
    .join("\n");
}

export function textForSelection(selection: ProofPresetSelection): string | null {
  if (selection.mode === "custom") return null;
  return composeProofText(
    selection.mode === "all" ? proofPresets.map((preset) => preset.id) : selection.ids,
  );
}

export function toggleProofPreset(
  selection: ProofPresetSelection,
  id: ProofPresetId,
): ProofPresetSelection {
  if (selection.mode !== "selected") return { mode: "selected", ids: [id] };

  const ids = selection.ids.includes(id)
    ? selection.ids.filter((selectedId) => selectedId !== id)
    : [...selection.ids, id];

  if (ids.length === 0) return { mode: "all" };
  const order = new Map(proofPresets.map((preset, index) => [preset.id, index]));
  return { mode: "selected", ids: ids.toSorted((a, b) => order.get(a)! - order.get(b)!) };
}

export function selectedPresetCount(selection: ProofPresetSelection): number {
  if (selection.mode === "all") return proofPresets.length;
  if (selection.mode === "selected") return selection.ids.length;
  return 0;
}
