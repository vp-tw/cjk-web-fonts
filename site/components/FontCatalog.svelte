<script lang="ts">
  import { debounce } from "es-toolkit";
  import { onMount } from "svelte";

  import type { CatalogFontRecord, CatalogFontVariant, Cdn } from "../lib/catalog";
  import { formatCodePoint } from "../lib/coverage";
  import type { CoverageResponse } from "../workers/coverage.worker";

  // oxlint-disable-next-line no-unassigned-vars -- assigned by the Astro parent component
  export let fonts: CatalogFontRecord[];
  export let cdns: Cdn[];

  const defaultText = "臺北下雨了，𠮷野家門口有人等公車。\nCheck names, addresses, and long-form copy here.";
  let committedPreviewText = defaultText;
  let committedQuery = "";
  let fontSize = 72;
  let foreground = "#171816";
  let background = "#e7e3d8";
  let theme: "light" | "dark" | "system" = "system";
  let selectedCdn = "jsdelivr";
  let onlyComplete = false;
  let selectedVariants = Object.fromEntries(
    fonts.map((font) => [
      font.id,
      font.variants.find((variant) => variant.id === "regular")?.id ??
        font.variants[0].id,
    ]),
  );
  let missing: Record<string, number[]> = {};
  let coveragePending = true;
  let copied = "";
  let visibleSpecimenIds = new Set<string>();
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
    requestCoverage(committedPreviewText);
    return () => {
      commitPreviewText.cancel();
      commitQuery.cancel();
      worker?.terminate();
    };
  });

  $: if (mounted) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("cjk-theme", theme);
  }

  $: queryMatchingFonts = fonts.filter((font) => {
    const needle = committedQuery.trim().toLocaleLowerCase();
    return (
      !needle ||
      `${font.label} ${font.description} ${font.packageName}`
        .toLocaleLowerCase()
        .includes(needle)
    );
  });
  $: visibleFonts = queryMatchingFonts.filter(
    (font) =>
      !onlyComplete || (!coveragePending && (missing[font.id]?.length ?? 0) === 0),
  );
  $: if (mounted) {
    for (const fontId of visibleSpecimenIds) {
      const font = fonts.find((candidate) => candidate.id === fontId);
      if (font && visibleFonts.includes(font)) {
        ensureStylesheet(variantFor(font).urls[selectedCdn]);
      }
    }
  }

  const commitPreviewText = debounce((text: string) => {
    committedPreviewText = text;
    requestCoverage(text);
  }, 400);

  const commitQuery = debounce((value: string) => {
    committedQuery = value;
  }, 250);

  function handlePreviewInput(event: Event) {
    commitPreviewText((event.currentTarget as HTMLTextAreaElement).value);
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

  function observeSpecimen(node: HTMLElement, fontId: string) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || visibleSpecimenIds.has(fontId)) return;
        visibleSpecimenIds = new Set(visibleSpecimenIds).add(fontId);
        observer.disconnect();
      },
      { rootMargin: "-25% 0px -25% 0px" },
    );
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }

  function variantFor(font: CatalogFontRecord): CatalogFontVariant {
    return (
      font.variants.find((variant) => variant.id === selectedVariants[font.id]) ??
      font.variants[0]
    );
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
  <div class="proof-area">
    <div class="proof-heading">
      <div>
        <h1 id="proof-title">輸入文字，找出沒有缺字的字型</h1>
        <p>檢查會在你的瀏覽器中執行，輸入內容不會上傳。</p>
      </div>
      <div class="result-count" aria-live="polite">
        <strong>{visibleFonts.length}</strong>
        <span>/ {fonts.length} 字型</span>
      </div>
    </div>

    <label class="proof-label" for="master-proof">要檢查的文字</label>
    <textarea
      id="master-proof"
      value={defaultText}
      on:input={handlePreviewInput}
      class="master-proof"
      aria-label="要檢查的文字"
      placeholder="貼上標題、姓名、地址或整篇文章"
      spellcheck="false"
      style:color={foreground}
      style:background={background}
    ></textarea>

    {#if variationSelectorPattern.test(committedPreviewText)}
      <p class="coverage-notice">
        內容含異體字選擇符。本頁檢查基底字元；字形序列請以套件 audit 結果為準。
      </p>
    {/if}
  </div>

  <div class="control-rail">
    <div class="rail-index" aria-hidden="true">SPEC / 001</div>
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
    <div class="catalog-head">
      <p>可用字型</p>
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
      {#each visibleFonts as font (font.id)}
        {@const variant = variantFor(font)}
        {@const missingPoints = missing[font.id] ?? []}
        <article class="font-specimen" use:observeSpecimen={font.id}>
          <header>
            <div>
              <h3>{font.label}</h3>
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
              {#if font.variants.length > 1}
                <label>
                  <span class="sr-only">{font.label} 變體</span>
                  <select bind:value={selectedVariants[font.id]}>
                    {#each font.variants as option}
                      <option value={option.id}>{option.label}</option>
                    {/each}
                  </select>
                </label>
              {:else}
                <span class="variant-label">{variant.label}</span>
              {/if}
            </div>
          </header>

          <div
            class="live-specimen"
            style:font-family={familyStack(variant)}
            style:--preview-size={`${fontSize}px`}
            style:font-weight={variant.weight}
            style:font-style={variant.style}
            style:font-stretch={variant.stretch}
            style:color={foreground}
            style:background={background}
          >
            {visibleSpecimenIds.has(font.id) ? committedPreviewText || "開始輸入文字" : ""}
          </div>

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
            <nav aria-label={`${font.label} 相關連結`}>
              <a href={font.sourceUrl} target="_blank" rel="noreferrer">上游來源</a>
              <a href={font.repositoryUrl} target="_blank" rel="noreferrer">套件文件</a>
            </nav>
          </footer>
        </article>
      {:else}
        <div class="empty-state">
          {#if committedQuery.trim() && queryMatchingFonts.length === 0}
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
