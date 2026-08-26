<script lang="ts">
  import { debounce } from "es-toolkit";
  import { onMount } from "svelte";

  import { type CatalogFontRecord, type CatalogFontVariant, type Cdn } from "../lib/catalog";
  import { groupCatalogFonts, type CatalogFontFamily } from "../lib/catalog-families";
  import { formatCodePoint } from "../lib/coverage";
  import { observeSpecimenLoading, type ObserverFactory } from "../lib/specimen-loading";
  import type { CoverageResponse } from "../workers/coverage.worker";

  // oxlint-disable-next-line no-unassigned-vars -- assigned by the Astro parent component
  export let fonts: CatalogFontRecord[];
  export let cdns: Cdn[];

  const defaultText = `ABC xyz 0123456789 !? … — () [] ＡＢＣ１２３ ☀︎ ★ ↔︎
日本語：東京で珈琲を飲み、ひらがな・カタカナ・漢字を比べる。
한국어: 서울의 봄날, 한글과 漢字를 함께 살펴봅니다.
粵語：佢喺邊度？唔該畀杯凍檸茶我，𠺢𠹌啲字都要試。
ㄅㄆㄇㄈ：今天天氣真好，ㄓㄨˋ ㄧㄣ ㄈㄨˊ ㄏㄠˋ。
正體：臺灣製造、雙層公寓、躍過鬱鬱蔥蔥的山巒。
简体：汉字转换、后发优势、云端数据库与软件测试。
特殊與罕見：𠮷 𡘙 𪚥 𫝀 𫠜 𬺰 𰻞 龘 䨻 葛󠄀`;
  const fontFamilies = groupCatalogFonts(fonts);
  let previewText = defaultText;
  let committedQuery = "";
  let fontSize = 72;
  let foreground = "#171816";
  let background = "#e7e3d8";
  let theme: "light" | "dark" | "system" = "system";
  let selectedCdn = "jsdelivr";
  let onlyComplete = false;
  let selectedFontIds = Object.fromEntries(
    fontFamilies.map((family) => [family.id, family.defaultFontId]),
  );
  let selectedVariants = Object.fromEntries(
    fonts.map((font) => [
      font.id,
      font.variants.find((variant) => variant.id === "regular")?.id ??
        font.variants.find((variant) => variant.id === "variable")?.id ??
        font.variants[0].id,
    ]),
  );
  let selectedWeights = Object.fromEntries(fontFamilies.map((family) => [family.id, 400]));
  let missing: Record<string, number[]> = {};
  let coveragePending = true;
  let copied = "";
  let visibleSpecimenIds = new Set<string>();
  let nearbySpecimenIds = new Set<string>();
  const specimenNodes = new Map<string, HTMLTextAreaElement>();
  let worker: Worker | undefined;
  let latestCoverageRequestId = 0;
  let mounted = false;

  const variationSelectorPattern = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/u;

  onMount(() => {
    mounted = true;
    const savedTheme = localStorage.getItem("cjk-theme");
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
      theme = savedTheme;
    }
    worker = new Worker(new URL("../workers/coverage.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<CoverageResponse>) => {
      if (event.data.requestId !== latestCoverageRequestId) return;
      missing = event.data.results;
      coveragePending = false;
    };
    requestCoverage(previewText);
    return () => {
      commitCoverage.cancel();
      commitQuery.cancel();
      worker?.terminate();
    };
  });

  $: if (mounted) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("cjk-theme", theme);
  }

  $: queryMatchingFamilies = fontFamilies.filter((family) => {
    const needle = committedQuery.trim().toLocaleLowerCase();
    return (
      !needle ||
      `${family.label} ${family.fonts
        .map((font) => `${font.label} ${font.description} ${font.packageName}`)
        .join(" ")}`
        .toLocaleLowerCase()
        .includes(needle)
    );
  });
  $: visibleFamilies = queryMatchingFamilies.filter(
    (family) =>
      !onlyComplete ||
      (!coveragePending && (missing[fontFor(family).id]?.length ?? 0) === 0),
  );
  $: if (mounted) {
    for (const familyId of nearbySpecimenIds) {
      const family = fontFamilies.find((candidate) => candidate.id === familyId);
      if (family && visibleFamilies.includes(family)) {
        const font = fontFor(family);
        ensureStylesheet(variantFor(font).urls[selectedCdn]);
      }
    }
  }

  const commitCoverage = debounce((text: string) => {
    requestCoverage(text);
  }, 400);

  const commitQuery = debounce((value: string) => {
    committedQuery = value;
  }, 250);

  function handlePreviewInput(event: Event) {
    const source = event.currentTarget as HTMLTextAreaElement;
    previewText = source.value;
    for (const fontId of visibleSpecimenIds) {
      const specimen = specimenNodes.get(fontId);
      if (specimen && specimen !== source && specimen.value !== previewText) {
        specimen.value = previewText;
      }
    }
    coveragePending = true;
    latestCoverageRequestId += 1;
    commitCoverage(previewText);
  }

  function handlePreviewFocus(event: FocusEvent) {
    const specimen = event.currentTarget as HTMLTextAreaElement;
    if (specimen.value !== previewText) specimen.value = previewText;
  }

  function handleQueryInput(event: Event) {
    commitQuery((event.currentTarget as HTMLInputElement).value);
  }

  function requestCoverage(text: string) {
    if (!worker) return;
    coveragePending = true;
    latestCoverageRequestId += 1;
    worker.postMessage({ type: "match", requestId: latestCoverageRequestId, text });
  }

  function observeSpecimen(node: HTMLTextAreaElement, familyId: string) {
    specimenNodes.set(familyId, node);
    node.value = previewText;
    let currentViewportHeight = document.documentElement.clientHeight;
    let destroyObservers = () => {};
    const createObserver: ObserverFactory = (callback, options) => {
      const observer = new IntersectionObserver(callback, options);
      return observer;
    };
    const startObservers = () => {
      destroyObservers();
      currentViewportHeight = document.documentElement.clientHeight;
      destroyObservers = observeSpecimenLoading({
        node,
        viewportHeight: currentViewportHeight,
        createObserver,
        onNearby: () => {
          nearbySpecimenIds = new Set(nearbySpecimenIds).add(familyId);
        },
        onVisible: (isVisible) => {
          const visible = new Set(visibleSpecimenIds);
          if (isVisible) {
            visible.add(familyId);
            if (node.value !== previewText) node.value = previewText;
          } else {
            visible.delete(familyId);
          }
          visibleSpecimenIds = visible;
        },
      });
    };
    const handleResize = () => {
      if (document.documentElement.clientHeight === currentViewportHeight) return;
      startObservers();
    };
    startObservers();
    window.addEventListener("resize", handleResize);
    return {
      destroy: () => {
        destroyObservers();
        window.removeEventListener("resize", handleResize);
        specimenNodes.delete(familyId);
        if (!visibleSpecimenIds.has(familyId)) return;
        const visible = new Set(visibleSpecimenIds);
        visible.delete(familyId);
        visibleSpecimenIds = visible;
      },
    };
  }

  function fontFor(family: CatalogFontFamily): CatalogFontRecord {
    return (
      family.fonts.find((font) => font.id === selectedFontIds[family.id]) ?? family.fonts[0]
    );
  }

  function variantFor(font: CatalogFontRecord): CatalogFontVariant {
    return (
      font.variants.find((variant) => variant.id === selectedVariants[font.id]) ??
      font.variants[0]
    );
  }

  function uniqueWeightOptions(font: CatalogFontRecord): CatalogFontVariant[] {
    return font.variants.filter(
      (variant, index, variants) =>
        variants.findIndex((candidate) => candidate.weight === variant.weight) === index,
    );
  }

  function weightVariantId(font: CatalogFontRecord, weight: number): string {
    const current = variantFor(font);
    const shapeKey = variantShapeKey(current);
    const replacement =
      font.variants.find(
        (variant) => variant.weight === weight && variantShapeKey(variant) === shapeKey,
      ) ?? font.variants.find((variant) => variant.weight === weight);
    return replacement?.id ?? current.id;
  }

  function variantShapeKey(variant: CatalogFontVariant): string {
    return `${variant.families.join("|")}::${variant.style}::${variant.stretch}`;
  }

  function shapeOptions(font: CatalogFontRecord): CatalogFontVariant[] {
    return font.variants.filter(
      (variant, index, variants) =>
        variants.findIndex((candidate) => variantShapeKey(candidate) === variantShapeKey(variant)) ===
        index,
    );
  }

  function shapeLabel(variant: CatalogFontVariant): string {
    if (variant.style === "italic") return "Italic";
    if (variant.id.startsWith("mono-")) return "Monospaced";
    if (/^(light|regular|medium)$/u.test(variant.id)) return "Proportional";
    return variant.label;
  }

  function shapeVariantId(font: CatalogFontRecord, shape: CatalogFontVariant): string {
    const currentWeight = variantFor(font).weight;
    const shapeKey = variantShapeKey(shape);
    const replacement =
      font.variants.find(
        (variant) => variantShapeKey(variant) === shapeKey && variant.weight === currentWeight,
      ) ?? font.variants.find((variant) => variantShapeKey(variant) === shapeKey);
    return replacement?.id ?? variantFor(font).id;
  }

  function variableWeightRange(variant: CatalogFontVariant): [number, number] | null {
    const match = variant.label.match(/(\d+)[–-](\d+)/u);
    return match ? [Number(match[1]), Number(match[2])] : null;
  }

  function ensureStylesheet(url: string) {
    if (document.querySelector(`link[data-font-url="${url}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.dataset.fontUrl = url;
    document.head.append(link);
  }

  function familyStack(variant: CatalogFontVariant): string {
    return `${variant.families.map((family) => `"${family}"`).join(", ")}, sans-serif`;
  }

  function embedCode(font: CatalogFontRecord, cdnId: string): string {
    const variant = variantFor(font);
    return `<link rel="stylesheet" href="${variant.urls[cdnId]}">`;
  }

  async function copyEmbed(font: CatalogFontRecord) {
    const code = embedCode(font, selectedCdn);
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const field = document.createElement("textarea");
      field.value = code;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    copied = font.id;
    setTimeout(() => {
      if (copied === font.id) copied = "";
    }, 1800);
  }

  function glyph(point: number): string {
    return String.fromCodePoint(point);
  }
</script>

<section class="workbench" aria-labelledby="proof-title">
  <div class="catalog-intro">
    <div>
      <span class="catalog-index" aria-hidden="true">PROOF / LIVE</span>
      <h1 id="proof-title">直接在字型上輸入</h1>
      <p>編輯任一預覽，文字會同步到其他字型。缺字檢查只在瀏覽器中執行。</p>
    </div>
    <div class="result-count" aria-live="polite">
      <strong>{visibleFamilies.length}</strong>
      <span>/ {fontFamilies.length} 字族</span>
    </div>
  </div>

  <div class="control-rail">
    <div class="rail-index" aria-hidden="true">CTRL / 001</div>
    <label class="search-control">
      <span>搜尋字型</span>
      <input on:input={handleQueryInput} type="search" placeholder="名稱、套件或特徵" />
    </label>

    <fieldset class="theme-control">
      <legend>介面模式</legend>
      <div class="segments">
        {#each ["light", "dark", "system"] as option}
          <label class:active={theme === option}>
            <input bind:group={theme} type="radio" value={option} />
            {option === "light" ? "亮色" : option === "dark" ? "暗色" : "系統"}
          </label>
        {/each}
      </div>
    </fieldset>

    <label class="range-control">
      <span>字級 <output>{fontSize}px</output></span>
      <input bind:value={fontSize} type="range" min="20" max="128" step="1" />
    </label>

    <div class="color-controls">
      <label>
        <span>文字</span>
        <input bind:value={foreground} type="color" aria-label="預覽文字顏色" />
        <code>{foreground}</code>
      </label>
      <button
        class="swap-colors"
        type="button"
        aria-label="交換文字與背景顏色"
        on:click={() => ([foreground, background] = [background, foreground])}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 7h12m0 0-3-3m3 3-3 3M17 17H5m0 0 3 3m-3-3 3-3" />
        </svg>
      </button>
      <label>
        <span>紙色</span>
        <input bind:value={background} type="color" aria-label="預覽背景顏色" />
        <code>{background}</code>
      </label>
    </div>

    <label class="coverage-toggle">
      <input bind:checked={onlyComplete} type="checkbox" />
      <span>只看沒有缺字的字型</span>
    </label>
  </div>

  <div class="catalog-area" id="catalog">
    {#if variationSelectorPattern.test(previewText)}
      <p class="coverage-notice">
        內容含異體字選擇符。本頁檢查基底字元；字形序列請以套件 audit 結果為準。
      </p>
    {/if}
    <div class="catalog-head">
      <p>字型預覽</p>
      <label>
        CDN
        <select bind:value={selectedCdn}>
          {#each cdns as cdn}
            <option value={cdn.id}>{cdn.label}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="font-list" aria-busy={coveragePending}>
      {#each visibleFamilies as family (family.id)}
        {@const font = fontFor(family)}
        {@const variant = variantFor(font)}
        {@const missingPoints = missing[font.id] ?? []}
        {@const weights = uniqueWeightOptions(font)}
        {@const shapes = shapeOptions(font)}
        {@const weightRange = variableWeightRange(variant)}
        <article class="font-specimen">
          <header>
            <div>
              <h3>{family.label}</h3>
              <p>{font.packageName}@{font.version}</p>
            </div>
            <div class="specimen-status">
              {#if coveragePending}
                <span class="checking">檢查中</span>
              {:else if missingPoints.length === 0}
                <span class="complete">沒有缺字</span>
              {:else}
                <span class="missing">缺少 {missingPoints.length} 個字</span>
              {/if}
              {#if family.fonts.length > 1}
                <label class="variant-control">
                  <span>{family.axisLabel}</span>
                  <select bind:value={selectedFontIds[family.id]} aria-label={`${family.label} ${family.axisLabel}`}>
                    {#each family.fonts as option}
                      <option value={option.id}>{option.family?.valueLabel}</option>
                    {/each}
                  </select>
                </label>
              {/if}
              {#if shapes.length > 1}
                <label class="variant-control">
                  <span>樣式</span>
                  <select
                    bind:value={selectedVariants[font.id]}
                    aria-label={`${family.label} 樣式`}
                  >
                    {#each shapes as option}
                      <option value={shapeVariantId(font, option)}>{shapeLabel(option)}</option>
                    {/each}
                  </select>
                </label>
              {/if}
              {#if weightRange}
                <label class="weight-range-control">
                  <span>字重 <output>{selectedWeights[family.id]}</output></span>
                  <input
                    bind:value={selectedWeights[family.id]}
                    type="range"
                    min={weightRange[0]}
                    max={weightRange[1]}
                    step="1"
                    aria-label={`${family.label} 字重`}
                  />
                </label>
              {:else if weights.length > 1}
                <label class="variant-control">
                  <span>字重</span>
                  <select
                    bind:value={selectedVariants[font.id]}
                    aria-label={`${family.label} 字重`}
                  >
                    {#each weights as option}
                      <option value={weightVariantId(font, option.weight)}>{option.label}</option>
                    {/each}
                  </select>
                </label>
              {/if}
              {#if family.fonts.length === 1 && shapes.length === 1 && weights.length === 1 && !weightRange}
                <span class="variant-label">{variant.label}</span>
              {/if}
            </div>
          </header>

          <textarea
            class="live-specimen"
            aria-label={`${family.label} 預覽文字；輸入會同步至其他字型`}
            placeholder="在這裡輸入預覽文字"
            spellcheck="false"
            value={defaultText}
            use:observeSpecimen={family.id}
            on:input={handlePreviewInput}
            on:focus={handlePreviewFocus}
            style:font-family={visibleSpecimenIds.has(family.id) ? familyStack(variant) : "inherit"}
            style:--preview-size={`${fontSize}px`}
            style:font-weight={weightRange ? selectedWeights[family.id] : variant.weight}
            style:font-style={variant.style}
            style:font-stretch={variant.stretch}
            style:color={foreground}
            style:background={background}
          ></textarea>

          {#if !coveragePending && missingPoints.length > 0}
            <div class="missing-list" aria-label="缺少的字元">
              {#each missingPoints.slice(0, 16) as point}
                <span title={formatCodePoint(point)}>{glyph(point)}</span>
              {/each}
              {#if missingPoints.length > 16}<span>＋{missingPoints.length - 16}</span>{/if}
            </div>
          {/if}

          <footer>
            <div class="font-facts">
              <span>{variant.label}</span>
              <span>{variant.characterCount.toLocaleString()} code points</span>
              <span>{font.license}</span>
            </div>
            <div class="embed-line">
              <code>{embedCode(font, selectedCdn)}</code>
              <button type="button" on:click={() => copyEmbed(font)}>
                {copied === font.id ? "已複製" : "複製 embed"}
              </button>
            </div>
            <nav aria-label={`${family.label} 相關連結`}>
              <a href={font.sourceUrl} target="_blank" rel="noreferrer">上游來源</a>
              <a href={font.repositoryUrl} target="_blank" rel="noreferrer">套件文件</a>
            </nav>
          </footer>
        </article>
      {:else}
        <div class="empty-state">
          {#if committedQuery.trim() && queryMatchingFamilies.length === 0}
            <h3>找不到符合搜尋條件的字型</h3>
            <p>請改用字型名稱、套件名稱或其他特徵搜尋。</p>
          {:else if coveragePending}
            <h3>正在檢查字型涵蓋範圍</h3>
            <p>完成後會顯示沒有缺字的字型。</p>
          {:else if onlyComplete}
            <h3>沒有字型涵蓋全部文字</h3>
            <p>關閉「只看沒有缺字的字型」，查看各字型缺少哪些字。</p>
          {:else}
            <h3>目前沒有可用字型</h3>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
