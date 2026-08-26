import type { ProofPresetId } from "./proof-presets";

export const locales = ["en", "zh-Hant", "zh-Hans", "ja", "ko"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  "zh-Hant": "繁體中文",
  "zh-Hans": "简体中文",
  ja: "日本語",
  ko: "한국어",
};

export interface Messages {
  meta: { description: string; title: string; ogImageAlt: string };
  header: { navLabel: string; start: string; language: string };
  footer: { maintained: string; source: string };
  localeSuggestion: { message: string; switch: string; dismiss: string };
  catalog: {
    title: string;
    intro: string;
    families: string;
    search: string;
    searchPlaceholder: string;
    appearance: string;
    light: string;
    dark: string;
    system: string;
    proofPresets: string;
    all: string;
    customContent: string;
    presetSummary: string;
    fontSize: string;
    textColor: string;
    previewTextColor: string;
    swapColors: string;
    paperColor: string;
    previewBackgroundColor: string;
    completeOnly: string;
    variationNotice: string;
    preview: string;
    checking: string;
    complete: string;
    missingCount: string;
    style: string;
    weight: string;
    specimenLabel: string;
    specimenPlaceholder: string;
    missingCharacters: string;
    codePoints: string;
    copied: string;
    copyEmbed: string;
    relatedLinks: string;
    upstreamSource: string;
    packageDocs: string;
    noSearchTitle: string;
    noSearchBody: string;
    checkingTitle: string;
    checkingBody: string;
    noCompleteTitle: string;
    noCompleteBody: string;
    noFontsTitle: string;
    proportional: string;
    monospaced: string;
    italic: string;
    width: string;
  };
  presets: Record<ProofPresetId, string>;
  pwa: {
    updateFailed: string;
    updateReady: string;
    offlineReady: string;
    updateFailedBody: string;
    updateReadyBody: string;
    offlineReadyBody: string;
    updating: string;
    retry: string;
    updateNow: string;
    later: string;
    acknowledge: string;
  };
}

const en: Messages = {
  meta: {
    description: "CJK web fonts, ready to use.",
    title: "CJK Web Fonts — Ready to use",
    ogImageAlt:
      "CJK Web Fonts poster with the 字, あ, and 한 brand mark, repository name, and website URL.",
  },
  header: { navLabel: "Primary navigation", start: "Start checking", language: "Language" },
  footer: {
    maintained:
      "CJK Web Fonts is maintained by VP–TW. Font licenses follow their upstream projects.",
    source: "Source and package documentation",
  },
  localeSuggestion: {
    message: "This page is also available in {language}.",
    switch: "View in {language}",
    dismiss: "Keep English",
  },
  catalog: {
    title: "Type directly in each font",
    intro:
      "Edit any specimen to sync the text across every font. Coverage checks run only in your browser.",
    families: "families",
    search: "Search fonts",
    searchPlaceholder: "Name, package, or feature",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    system: "System",
    proofPresets: "Proof presets",
    all: "All",
    customContent: "Custom content",
    presetSummary: "{presets} presets · {characters} required characters",
    fontSize: "Font size",
    textColor: "Text",
    previewTextColor: "Preview text color",
    swapColors: "Swap text and background colors",
    paperColor: "Paper",
    previewBackgroundColor: "Preview background color",
    completeOnly: "Show fonts with complete coverage only",
    variationNotice:
      "This content includes variation selectors. This page checks base characters; use the package audit as the authority for glyph sequences.",
    preview: "Font preview",
    checking: "Checking",
    complete: "Complete coverage",
    missingCount: "Missing {count} characters",
    style: "Style",
    weight: "Weight",
    specimenLabel: "{family} preview text; input syncs to other fonts",
    specimenPlaceholder: "Type preview text here",
    missingCharacters: "Missing characters",
    codePoints: "code points",
    copied: "Copied",
    copyEmbed: "Copy embed",
    relatedLinks: "Related links for {family}",
    upstreamSource: "Upstream source",
    packageDocs: "Package documentation",
    noSearchTitle: "No fonts match your search",
    noSearchBody: "Try a font name, package name, or another feature.",
    checkingTitle: "Checking font coverage",
    checkingBody: "Fonts with complete coverage will appear when the check finishes.",
    noCompleteTitle: "No font covers all the text",
    noCompleteBody:
      "Reduce the proof presets, or turn off the complete-coverage filter to inspect missing characters.",
    noFontsTitle: "No fonts are currently available",
    proportional: "Proportional",
    monospaced: "Monospaced",
    italic: "Italic",
    width: "Width",
  },
  presets: {
    latin: "Latin",
    symbols: "Symbols",
    bopomofo: "Bopomofo",
    japanese: "Japanese",
    korean: "Korean",
    cantonese: "Cantonese",
    traditional: "Traditional Chinese",
    simplified: "Simplified Chinese",
    rare: "Rare characters",
  },
  pwa: {
    updateFailed: "Update not completed",
    updateReady: "Update available",
    offlineReady: "Ready offline",
    updateFailedBody: "Try again. If the update still fails, reload the page.",
    updateReadyBody: "The update has downloaded. Reload to use the latest version.",
    offlineReadyBody: "The interface can now open offline. Fonts are retained as you use them.",
    updating: "Updating…",
    retry: "Try again",
    updateNow: "Update now",
    later: "Later",
    acknowledge: "Got it",
  },
};

const zhHant: Messages = {
  meta: {
    description: "可直接測試與嵌入的 CJK 網頁字型。",
    title: "CJK Web Fonts — 開箱即用",
    ogImageAlt: "CJK Web Fonts 海報，包含字、あ、한 品牌標誌、儲存庫名稱與網站網址。",
  },
  header: { navLabel: "主要導覽", start: "開始檢查", language: "語言" },
  footer: {
    maintained: "CJK Web Fonts 由 VP–TW 維護。字型授權依其上游專案為準。",
    source: "原始碼與套件文件",
  },
  localeSuggestion: {
    message: "本頁也提供{language}版本。",
    switch: "切換至{language}",
    dismiss: "繼續使用英文",
  },
  catalog: {
    title: "直接在字型上輸入",
    intro: "編輯任一預覽，文字會同步到其他字型。缺字檢查只在瀏覽器中執行。",
    families: "字族",
    search: "搜尋字型",
    searchPlaceholder: "名稱、套件或特徵",
    appearance: "介面模式",
    light: "亮色",
    dark: "暗色",
    system: "系統",
    proofPresets: "測試範本",
    all: "全部",
    customContent: "自訂內容",
    presetSummary: "{presets} 組範本 · {characters} 個必要字元",
    fontSize: "字級",
    textColor: "文字",
    previewTextColor: "預覽文字顏色",
    swapColors: "交換文字與背景顏色",
    paperColor: "紙色",
    previewBackgroundColor: "預覽背景顏色",
    completeOnly: "只看沒有缺字的字型",
    variationNotice: "內容含異體字選擇符。本頁檢查基底字元；字形序列請以套件 audit 結果為準。",
    preview: "字型預覽",
    checking: "檢查中",
    complete: "沒有缺字",
    missingCount: "缺少 {count} 個字",
    style: "樣式",
    weight: "字重",
    specimenLabel: "{family} 預覽文字；輸入會同步至其他字型",
    specimenPlaceholder: "在這裡輸入預覽文字",
    missingCharacters: "缺少的字元",
    codePoints: "個碼位",
    copied: "已複製",
    copyEmbed: "複製 embed",
    relatedLinks: "{family} 相關連結",
    upstreamSource: "上游來源",
    packageDocs: "套件文件",
    noSearchTitle: "找不到符合搜尋條件的字型",
    noSearchBody: "請改用字型名稱、套件名稱或其他特徵搜尋。",
    checkingTitle: "正在檢查字型涵蓋範圍",
    checkingBody: "完成後會顯示沒有缺字的字型。",
    noCompleteTitle: "沒有字型涵蓋全部文字",
    noCompleteBody: "縮小測試範本，或關閉「只看沒有缺字的字型」查看缺少哪些字。",
    noFontsTitle: "目前沒有可用字型",
    proportional: "比例寬度",
    monospaced: "等寬",
    italic: "斜體",
    width: "字寬",
  },
  presets: {
    latin: "拉丁文",
    symbols: "符號",
    bopomofo: "注音",
    japanese: "日文",
    korean: "韓文",
    cantonese: "粵語",
    traditional: "正體",
    simplified: "簡體",
    rare: "罕見字",
  },
  pwa: {
    updateFailed: "更新未完成",
    updateReady: "有新版可用",
    offlineReady: "已可離線使用",
    updateFailedBody: "請再試一次；若仍無法更新，請重新整理頁面。",
    updateReadyBody: "更新已下載完成。重新載入即可使用最新版本。",
    offlineReadyBody: "網站介面已可在離線時開啟；字型會在使用後逐步保留。",
    updating: "正在更新…",
    retry: "再試一次",
    updateNow: "立即更新",
    later: "稍後",
    acknowledge: "知道了",
  },
};

const zhHans: Messages = {
  ...zhHant,
  meta: {
    description: "可直接测试与嵌入的 CJK 网页字体。",
    title: "CJK Web Fonts — 开箱即用",
    ogImageAlt: "CJK Web Fonts 海报，包含字、あ、한 品牌标志、仓库名称与网站网址。",
  },
  header: { navLabel: "主导航", start: "开始检查", language: "语言" },
  footer: {
    maintained: "CJK Web Fonts 由 VP–TW 维护。字体许可依其上游项目为准。",
    source: "源代码与软件包文档",
  },
  localeSuggestion: {
    message: "本页也提供{language}版本。",
    switch: "切换至{language}",
    dismiss: "继续使用英文",
  },
  catalog: {
    ...zhHant.catalog,
    title: "直接在字体上输入",
    intro: "编辑任一预览，文字会同步到其他字体。缺字检查只在浏览器中执行。",
    families: "字体系列",
    search: "搜索字体",
    searchPlaceholder: "名称、软件包或特征",
    appearance: "界面模式",
    light: "亮色",
    dark: "暗色",
    system: "系统",
    proofPresets: "测试范本",
    all: "全部",
    customContent: "自定义内容",
    presetSummary: "{presets} 组范本 · {characters} 个必要字符",
    fontSize: "字号",
    textColor: "文字",
    previewTextColor: "预览文字颜色",
    swapColors: "交换文字与背景颜色",
    paperColor: "纸色",
    previewBackgroundColor: "预览背景颜色",
    completeOnly: "只看没有缺字的字体",
    variationNotice: "内容含异体字选择符。本页检查基础字符；字形序列请以软件包审计结果为准。",
    preview: "字体预览",
    checking: "检查中",
    complete: "没有缺字",
    missingCount: "缺少 {count} 个字",
    style: "样式",
    weight: "字重",
    specimenLabel: "{family} 预览文字；输入会同步至其他字体",
    specimenPlaceholder: "在这里输入预览文字",
    missingCharacters: "缺少的字符",
    codePoints: "个码位",
    copied: "已复制",
    copyEmbed: "复制 embed",
    relatedLinks: "{family} 相关链接",
    upstreamSource: "上游来源",
    packageDocs: "软件包文档",
    noSearchTitle: "找不到符合搜索条件的字体",
    noSearchBody: "请改用字体名称、软件包名称或其他特征搜索。",
    checkingTitle: "正在检查字体覆盖范围",
    checkingBody: "完成后会显示没有缺字的字体。",
    noCompleteTitle: "没有字体覆盖全部文字",
    noCompleteBody: "减少测试范本，或关闭“只看没有缺字的字体”以查看缺少哪些字。",
    noFontsTitle: "目前没有可用字体",
    proportional: "比例宽度",
    monospaced: "等宽",
    italic: "斜体",
    width: "字宽",
  },
  presets: {
    latin: "拉丁文",
    symbols: "符号",
    bopomofo: "注音",
    japanese: "日文",
    korean: "韩文",
    cantonese: "粤语",
    traditional: "繁体",
    simplified: "简体",
    rare: "罕见字",
  },
  pwa: {
    updateFailed: "更新未完成",
    updateReady: "有新版本可用",
    offlineReady: "已可离线使用",
    updateFailedBody: "请重试；若仍无法更新，请刷新页面。",
    updateReadyBody: "更新已下载。重新加载即可使用最新版本。",
    offlineReadyBody: "网站界面现可离线打开；字体会在使用后逐步保留。",
    updating: "正在更新…",
    retry: "重试",
    updateNow: "立即更新",
    later: "稍后",
    acknowledge: "知道了",
  },
};

const ja: Messages = {
  ...en,
  meta: {
    description: "すぐに試せて組み込める CJK Web フォント。",
    title: "CJK Web Fonts — すぐに使える",
    ogImageAlt:
      "字、あ、한のブランドマーク、リポジトリ名、サイトURLを載せた CJK Web Fonts のポスター。",
  },
  header: { navLabel: "メインナビゲーション", start: "チェックを開始", language: "言語" },
  footer: {
    maintained:
      "CJK Web Fonts は VP–TW が管理しています。フォントのライセンスは各上流プロジェクトに従います。",
    source: "ソースとパッケージ資料",
  },
  localeSuggestion: {
    message: "このページは{language}でも利用できます。",
    switch: "{language}で表示",
    dismiss: "英語のまま表示",
  },
  catalog: {
    ...en.catalog,
    title: "各フォントに直接入力",
    intro:
      "どの見本を編集しても、すべてのフォントに文字が同期されます。文字収録の確認はブラウザ内だけで行われます。",
    families: "ファミリー",
    search: "フォントを検索",
    searchPlaceholder: "名前、パッケージ、特徴",
    appearance: "表示モード",
    light: "ライト",
    dark: "ダーク",
    system: "システム",
    proofPresets: "テスト見本",
    all: "すべて",
    customContent: "カスタム内容",
    presetSummary: "見本 {presets} 組 · 必須文字 {characters} 字",
    fontSize: "文字サイズ",
    textColor: "文字",
    previewTextColor: "見本文字の色",
    swapColors: "文字色と背景色を入れ替える",
    paperColor: "紙色",
    previewBackgroundColor: "見本の背景色",
    completeOnly: "全文字を収録するフォントのみ表示",
    variationNotice:
      "異体字セレクターが含まれています。このページでは基底文字を確認します。字形シーケンスはパッケージ監査を正としてください。",
    preview: "フォント見本",
    checking: "確認中",
    complete: "全文字を収録",
    missingCount: "{count}文字不足",
    style: "スタイル",
    weight: "ウェイト",
    specimenLabel: "{family}の見本文字。入力は他のフォントにも同期されます",
    specimenPlaceholder: "見本文字を入力",
    missingCharacters: "不足している文字",
    codePoints: "コードポイント",
    copied: "コピー済み",
    copyEmbed: "埋め込みをコピー",
    relatedLinks: "{family}の関連リンク",
    upstreamSource: "上流ソース",
    packageDocs: "パッケージ資料",
    noSearchTitle: "検索条件に一致するフォントがありません",
    noSearchBody: "フォント名、パッケージ名、別の特徴で検索してください。",
    checkingTitle: "文字収録を確認中",
    checkingBody: "確認が完了すると、全文字を収録するフォントが表示されます。",
    noCompleteTitle: "全文字を収録するフォントがありません",
    noCompleteBody: "テスト見本を減らすか、全文字フィルターを解除して不足文字を確認してください。",
    noFontsTitle: "現在利用できるフォントがありません",
    proportional: "プロポーショナル",
    monospaced: "等幅",
    italic: "イタリック",
    width: "字幅",
  },
  presets: {
    latin: "ラテン文字",
    symbols: "記号",
    bopomofo: "注音符号",
    japanese: "日本語",
    korean: "韓国語",
    cantonese: "広東語",
    traditional: "繁体字中国語",
    simplified: "簡体字中国語",
    rare: "希少文字",
  },
  pwa: {
    updateFailed: "更新できませんでした",
    updateReady: "更新があります",
    offlineReady: "オフラインで利用可能",
    updateFailedBody: "もう一度お試しください。更新できない場合はページを再読み込みしてください。",
    updateReadyBody: "更新をダウンロードしました。再読み込みすると最新版を利用できます。",
    offlineReadyBody:
      "画面をオフラインで開けるようになりました。フォントは使用後に順次保存されます。",
    updating: "更新中…",
    retry: "再試行",
    updateNow: "今すぐ更新",
    later: "後で",
    acknowledge: "了解",
  },
};

const ko: Messages = {
  ...en,
  meta: {
    description: "바로 시험하고 삽입할 수 있는 CJK 웹 폰트입니다.",
    title: "CJK Web Fonts — 바로 사용 가능",
    ogImageAlt:
      "字, あ, 한 브랜드 마크와 저장소 이름, 웹사이트 주소가 있는 CJK Web Fonts 포스터입니다.",
  },
  header: { navLabel: "기본 탐색", start: "검사 시작", language: "언어" },
  footer: {
    maintained: "CJK Web Fonts는 VP–TW가 관리합니다. 폰트 라이선스는 각 원본 프로젝트를 따릅니다.",
    source: "소스 및 패키지 문서",
  },
  localeSuggestion: {
    message: "이 페이지는 {language}로도 제공됩니다.",
    switch: "{language}로 보기",
    dismiss: "영어로 계속",
  },
  catalog: {
    ...en.catalog,
    title: "각 폰트에 직접 입력",
    intro:
      "어느 미리보기를 편집해도 모든 폰트에 텍스트가 동기화됩니다. 글자 포함 여부는 브라우저 안에서만 검사합니다.",
    families: "패밀리",
    search: "폰트 검색",
    searchPlaceholder: "이름, 패키지 또는 특징",
    appearance: "화면 모드",
    light: "라이트",
    dark: "다크",
    system: "시스템",
    proofPresets: "시험 텍스트",
    all: "전체",
    customContent: "사용자 지정 내용",
    presetSummary: "시험 텍스트 {presets}개 · 필수 문자 {characters}개",
    fontSize: "글자 크기",
    textColor: "글자",
    previewTextColor: "미리보기 글자색",
    swapColors: "글자색과 배경색 바꾸기",
    paperColor: "종이",
    previewBackgroundColor: "미리보기 배경색",
    completeOnly: "모든 문자를 포함한 폰트만 표시",
    variationNotice:
      "이체자 선택자가 포함되어 있습니다. 이 페이지는 기본 문자를 검사합니다. 글리프 시퀀스는 패키지 감사를 기준으로 확인하세요.",
    preview: "폰트 미리보기",
    checking: "검사 중",
    complete: "모든 문자 포함",
    missingCount: "문자 {count}개 없음",
    style: "스타일",
    weight: "굵기",
    specimenLabel: "{family} 미리보기 텍스트. 입력 내용은 다른 폰트에도 동기화됩니다",
    specimenPlaceholder: "미리보기 텍스트 입력",
    missingCharacters: "없는 문자",
    codePoints: "코드 포인트",
    copied: "복사됨",
    copyEmbed: "삽입 코드 복사",
    relatedLinks: "{family} 관련 링크",
    upstreamSource: "원본 소스",
    packageDocs: "패키지 문서",
    noSearchTitle: "검색 조건과 일치하는 폰트가 없습니다",
    noSearchBody: "폰트 이름, 패키지 이름 또는 다른 특징으로 검색해 보세요.",
    checkingTitle: "문자 포함 여부 검사 중",
    checkingBody: "검사가 끝나면 모든 문자를 포함한 폰트가 표시됩니다.",
    noCompleteTitle: "모든 문자를 포함한 폰트가 없습니다",
    noCompleteBody: "시험 텍스트를 줄이거나 전체 포함 필터를 꺼서 없는 문자를 확인하세요.",
    noFontsTitle: "현재 사용할 수 있는 폰트가 없습니다",
    proportional: "비례폭",
    monospaced: "고정폭",
    italic: "이탤릭",
    width: "너비",
  },
  presets: {
    latin: "라틴 문자",
    symbols: "기호",
    bopomofo: "주음부호",
    japanese: "일본어",
    korean: "한국어",
    cantonese: "광둥어",
    traditional: "번체 중국어",
    simplified: "간체 중국어",
    rare: "희귀 문자",
  },
  pwa: {
    updateFailed: "업데이트하지 못했습니다",
    updateReady: "업데이트 가능",
    offlineReady: "오프라인 사용 가능",
    updateFailedBody: "다시 시도하세요. 계속 실패하면 페이지를 새로 고침하세요.",
    updateReadyBody: "업데이트를 다운로드했습니다. 최신 버전을 사용하려면 새로 고침하세요.",
    offlineReadyBody:
      "이제 화면을 오프라인으로 열 수 있습니다. 폰트는 사용한 뒤 차례로 저장됩니다.",
    updating: "업데이트 중…",
    retry: "다시 시도",
    updateNow: "지금 업데이트",
    later: "나중에",
    acknowledge: "확인",
  },
};

export const messages: Record<Locale, Messages> = {
  en,
  "zh-Hant": zhHant,
  "zh-Hans": zhHans,
  ja,
  ko,
};

export function localePath(locale: Locale, base: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return locale === "en" ? normalizedBase : `${normalizedBase}${locale.toLowerCase()}/`;
}

export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const normalized = language.toLowerCase();
    if (normalized === "zh-hant" || /^(zh-(tw|hk|mo))\b/u.test(normalized)) return "zh-Hant";
    if (normalized === "zh-hans" || /^(zh-(cn|sg|my))\b/u.test(normalized)) return "zh-Hans";
    if (normalized === "zh" || normalized.startsWith("zh-")) return "zh-Hans";
    if (normalized === "ja" || normalized.startsWith("ja-")) return "ja";
    if (normalized === "ko" || normalized.startsWith("ko-")) return "ko";
    if (normalized === "en" || normalized.startsWith("en-")) return "en";
  }
  return "en";
}

export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/gu, (match, key: string) => String(values[key] ?? match));
}
