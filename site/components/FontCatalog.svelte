<script lang="ts">
  import { debounce } from "es-toolkit";
  import { onMount } from "svelte";

  import {
    type CatalogFontRecord,
    type CatalogFontVariant,
    type Cdn,
    type WritingSystemId,
  } from "../lib/catalog";
  import { fontMatchesFilters, matchingVariantIds, type CatalogTypeFilter } from "../lib/catalog-filters";
  import {
    groupCatalogFonts,
    officialNameForLocale,
    type CatalogFontFamily,
  } from "../lib/catalog-families";
  import { formatCodePoint, uniqueRequiredCodePoints } from "../lib/coverage";
  import { contrastCompliance, contrastRatio } from "../lib/color-contrast";
  import { copyText } from "../lib/copy-text";
  import { searchFontFamilies } from "../lib/font-search";
  import { fontFamilyCss, fontFamilyValue } from "../lib/font-usage";
  import { formatMessage, localeNames, type Locale, type Messages } from "../lib/i18n";
  import {
    composeProofText,
    proofPresets,
    selectedPresetCount,
    textForSelection,
    toggleProofPreset,
    type ProofPresetId,
    type ProofPresetSelection,
  } from "../lib/proof-presets";
  import { observeSpecimenLoading, type ObserverFactory } from "../lib/specimen-loading";
  import type { CoverageResponse } from "../workers/coverage.worker";

  // oxlint-disable-next-line no-unassigned-vars -- assigned by the Astro parent component
  export let fonts: CatalogFontRecord[];
  export let cdns: Cdn[];
  // oxlint-disable-next-line no-unassigned-vars -- assigned by the Astro parent component
  export let locale: Locale;
  // oxlint-disable-next-line no-unassigned-vars -- assigned by the Astro parent component
  export let messages: Messages["catalog"];
  // oxlint-disable-next-line no-unassigned-vars -- assigned by the Astro parent component
  export let presetLabels: Messages["presets"];

  const defaultText = composeProofText(proofPresets.map((preset) => preset.id));
  const fontFamilies = groupCatalogFonts(fonts);
  let previewText = defaultText;
  let proofSelection: ProofPresetSelection = { mode: "all" };
  let committedQuery = "";
  let searchQuery = "";
  let selectedTypes: CatalogTypeFilter[] = [];
  let selectedLanguages: string[] = [];
  let selectedWritingSystems: WritingSystemId[] = [];
  let fontSize = 72;
  let foreground = "#171816";
  let background = "#e7e3d8";
  let theme: "light" | "dark" | "system" = "system";
  let selectedCdn = "jsdelivr";
  let selectedFallback = "system";
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
  let selectionRevisions: Record<string, number> = {};
  let missing: Record<string, number[]> = {};
  let coveragePending = true;
  let copied = "";
  let copyError = "";
  let visibleSpecimenIds = new Set<string>();
  let nearbySpecimenIds = new Set<string>();
  const specimenNodes = new Map<string, HTMLTextAreaElement>();
  let worker: Worker | undefined;
  let latestCoverageRequestId = 0;
  let mounted = false;
  // oxlint-disable-next-line no-unassigned-vars -- assigned by bind:this
  let filterDetails: HTMLDetailsElement;
  $: activeFilterCount = selectedTypes.length + selectedLanguages.length + selectedWritingSystems.length;
  $: hasActiveFilters = activeFilterCount > 0;

  const variationSelectorPattern = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/u;
  const defaultForeground = "#171816";
  const defaultBackground = "#e7e3d8";
  $: previewContrastRatio = contrastRatio(foreground, background);
  $: previewContrastCompliance = contrastCompliance(previewContrastRatio);
  $: previewColorsAreDefault = foreground === defaultForeground && background === defaultBackground;

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
  $: if (mounted && selectedFallback !== "system") {
    const fallback = fonts.find((font) => font.id === selectedFallback);
    if (fallback) ensureStylesheet(fallback.variants[0].urls[selectedCdn]);
  }

  $: queryMatchingFamilies = searchFontFamilies(fontFamilies, committedQuery).filter((family) =>
    family.fonts.some((font) =>
        fontMatchesFilters(font, {
          types: selectedTypes,
          languages: selectedLanguages,
          writingSystems: selectedWritingSystems,
        }),
      ),
  );
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

  function categoryOptions(): [CatalogTypeFilter, string][] {
    return [
      ["serif", messages.serif],
      ["sans-serif", messages.sansSerif],
      ["handwriting", messages.handwriting],
      ["monospace", messages.monospaced],
      ["symbols", messages.symbols],
      ["diagnostic", messages.diagnostic],
    ];
  }

  function languageOptions(): [string, string][] {
    return [
      ["zh_Hant", localeNames["zh-Hant"]],
      ["zh_Hans", localeNames["zh-Hans"]],
      ["ja_Jpan", localeNames.ja],
      ["ko_Kore", localeNames.ko],
      ["en_Latn", localeNames.en],
    ];
  }

  function writingSystemOptions(): [WritingSystemId, string][] {
    return [
      ["latin", presetLabels.latin],
      ["bopomofo", presetLabels.bopomofo],
      ["hiragana", messages.hiragana],
      ["katakana", messages.katakana],
      ["han", messages.han],
      ["hangul", messages.hangul],
      ["symbols", messages.symbols],
    ];
  }

  function clearFilters() {
    selectedTypes = [];
    selectedLanguages = [];
    selectedWritingSystems = [];
  }

  function clearSearchAndFilters() {
    commitQuery.cancel();
    searchQuery = "";
    committedQuery = "";
    clearFilters();
  }

  function viewResults() {
    filterDetails.open = false;
    const catalog = document.querySelector<HTMLElement>("#catalog");
    if (!catalog) return;
    catalog.focus({ preventScroll: true });
    catalog.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  function restorePreviewColors() {
    foreground = defaultForeground;
    background = defaultBackground;
  }

  function filterMatchIds(font: CatalogFontRecord): string[] {
    return matchingVariantIds(font, {
      types: selectedTypes,
      languages: selectedLanguages,
      writingSystems: selectedWritingSystems,
    });
  }

  function familyMatchTargets(family: CatalogFontFamily): { fontId: string; variantId: string }[] {
    return family.fonts.flatMap((font) =>
      filterMatchIds(font).map((variantId) => ({ fontId: font.id, variantId })),
    );
  }

  function previewFirstMatch(family: CatalogFontFamily) {
    const currentWeight = variantFor(fontFor(family)).weight;
    const targets = familyMatchTargets(family);
    let target = targets[0];
    for (const candidate of targets) {
      const candidateFont = family.fonts.find((item) => item.id === candidate.fontId);
      const candidateVariant = candidateFont?.variants.find(
        (item) => item.id === candidate.variantId,
      );
      if (candidateVariant?.weight === currentWeight) {
        target = candidate;
        break;
      }
    }
    if (!target) return;
    const targetFont = family.fonts.find((item) => item.id === target.fontId);
    const targetVariant = targetFont?.variants.find((item) => item.id === target.variantId);
    selectedFontIds = { ...selectedFontIds, [family.id]: target.fontId };
    selectedVariants = { ...selectedVariants, [target.fontId]: target.variantId };
    selectedWeights = {
      ...selectedWeights,
      [family.id]: targetVariant?.weight ?? currentWeight,
    };
    selectionRevisions = {
      ...selectionRevisions,
      [family.id]: (selectionRevisions[family.id] ?? 0) + 1,
    };
  }

  function handlePreviewInput(event: Event) {
    const source = event.currentTarget as HTMLTextAreaElement;
    previewText = source.value;
    proofSelection = { mode: "custom" };
    synchronizePreviewText(source);
    scheduleCoverage();
  }

  function synchronizePreviewText(source?: HTMLTextAreaElement) {
    for (const fontId of visibleSpecimenIds) {
      const specimen = specimenNodes.get(fontId);
      if (specimen && specimen !== source && specimen.value !== previewText) {
        specimen.value = previewText;
      }
    }
  }

  function scheduleCoverage() {
    coveragePending = true;
    latestCoverageRequestId += 1;
    commitCoverage(previewText);
  }

  function selectAllProofPresets() {
    applyProofSelection({ mode: "all" });
  }

  function togglePreset(id: ProofPresetId) {
    applyProofSelection(toggleProofPreset(proofSelection, id));
  }

  function applyProofSelection(selection: ProofPresetSelection) {
    const text = textForSelection(selection);
    if (text === null) return;
    proofSelection = selection;
    previewText = text;
    synchronizePreviewText();
    scheduleCoverage();
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
    if (variant.style === "italic") return messages.italic;
    if (variant.id.startsWith("mono-")) return messages.monospaced;
    if (/^(light|regular|medium)$/u.test(variant.id)) return messages.proportional;
    return variant.label;
  }

  function axisLabel(label: string): string {
    return label === "字寬" ? messages.width : label;
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

  function familyStack(variant: CatalogFontVariant, fallbackId: string): string {
    const fallback = fonts.find((font) => font.id === fallbackId);
    return fontFamilyValue(variant, fallback?.variants[0].families);
  }

  function embedCode(font: CatalogFontRecord, cdnId: string): string {
    const variant = variantFor(font);
    return `<link rel="stylesheet" href="${variant.urls[cdnId]}">`;
  }

  async function copyCodeValue(key: string, code: string) {
    copied = "";
    copyError = "";
    const copiedSuccessfully = await copyText(code, {
      clipboard: (text) => navigator.clipboard.writeText(text),
      fallback: (text) => {
        const field = document.createElement("textarea");
        field.value = text;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.append(field);
        field.select();
        try {
          return document.execCommand("copy");
        } finally {
          field.remove();
        }
      },
    });
    if (!copiedSuccessfully) {
      copyError = key;
      return;
    }
    copied = key;
    setTimeout(() => {
      if (copied === key) copied = "";
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
      <h1 id="proof-title">{messages.title}</h1>
      <p>{messages.intro}</p>
    </div>
    <div class="result-count" aria-live="polite">
      <strong>{visibleFamilies.length}</strong>
      <span>/ {fontFamilies.length} {messages.families}</span>
    </div>
  </div>

  <div class="control-rail">
    <div class="rail-index" aria-hidden="true">CTRL / 001</div>
    <label class="search-control">
      <span>{messages.search}</span>
      <input bind:value={searchQuery} on:input={handleQueryInput} type="search" placeholder={messages.searchPlaceholder} />
    </label>

    <details bind:this={filterDetails} class="filter-control">
      <summary>
        {messages.filters}
        {#if activeFilterCount > 0}<span class="filter-count">{formatMessage(messages.activeFilterCount, { count: activeFilterCount })}</span>{/if}
      </summary>
      <div>
        <fieldset class="filter-group">
          <legend>{messages.category}<small>{messages.typeFilterRule}</small></legend>
          <div class="filter-options">
            {#each categoryOptions() as [value, label]}
              <label class:active={selectedTypes.includes(value)}><input bind:group={selectedTypes} type="checkbox" {value} /><span>{label}</span></label>
            {/each}
          </div>
        </fieldset>
        <fieldset class="filter-group">
          <legend>{messages.languageFilter}<small>{messages.languageFilterRule}</small></legend>
          <div class="filter-options">
            {#each languageOptions() as [value, label]}
              <label class:active={selectedLanguages.includes(value)}><input bind:group={selectedLanguages} type="checkbox" {value} /><span>{label}</span></label>
            {/each}
          </div>
        </fieldset>
        <fieldset class="filter-group">
          <legend>{messages.writingSystem}<small>{messages.writingSystemFilterRule}</small></legend>
          <div class="filter-options">
            {#each writingSystemOptions() as [value, label]}
              <label class:active={selectedWritingSystems.includes(value)}><input bind:group={selectedWritingSystems} type="checkbox" {value} /><span>{label}</span></label>
            {/each}
          </div>
        </fieldset>
        {#if hasActiveFilters}<button class="clear-filters" type="button" on:click={clearFilters}>{messages.clearFilters}</button>{/if}
        <button class="view-results" type="button" on:click={viewResults}>{formatMessage(messages.viewResults, { count: visibleFamilies.length })}</button>
      </div>
    </details>

    <fieldset class="theme-control">
      <legend>{messages.appearance}</legend>
      <div class="segments">
        {#each ["light", "dark", "system"] as option}
          <label class:active={theme === option}>
            <input bind:group={theme} type="radio" value={option} />
            {option === "light" ? messages.light : option === "dark" ? messages.dark : messages.system}
          </label>
        {/each}
      </div>
    </fieldset>

    <fieldset class="proof-presets">
      <legend>{messages.proofPresets}</legend>
      <div class="preset-options">
        <button
          type="button"
          class:active={proofSelection.mode === "all"}
          aria-pressed={proofSelection.mode === "all"}
          on:click={selectAllProofPresets}>{messages.all}</button
        >
        {#each proofPresets as preset}
          <button
            type="button"
            class:active={proofSelection.mode === "selected" &&
              proofSelection.ids.includes(preset.id)}
            aria-pressed={proofSelection.mode === "selected" &&
              proofSelection.ids.includes(preset.id)}
            on:click={() => togglePreset(preset.id)}>{presetLabels[preset.id]}</button
          >
        {/each}
      </div>
      <p class="preset-summary" aria-live="polite">
        {#if proofSelection.mode === "custom"}
          {messages.customContent}
        {:else}
          {formatMessage(messages.presetSummary, { presets: selectedPresetCount(proofSelection), characters: uniqueRequiredCodePoints(previewText).length })}
        {/if}
      </p>
    </fieldset>

    <label class="range-control">
      <span>{messages.fontSize} <output>{fontSize}px</output></span>
      <input bind:value={fontSize} type="range" min="20" max="128" step="1" />
    </label>

    <label class="fallback-control">
      <span>{messages.missingGlyphFallback}</span>
      <select bind:value={selectedFallback}>
        <option value="system">{messages.systemDefault}</option>
        <option value="tofu">Tofu</option>
        <option value="adobe-notdef">Adobe NotDef</option>
        <option value="last-resort">Last Resort</option>
      </select>
      <small>{messages.fallbackPreviewOnly}</small>
    </label>

    <div class="color-controls">
      <label>
        <span>{messages.textColor}</span>
        <input bind:value={foreground} type="color" aria-label={messages.previewTextColor} />
        <code>{foreground}</code>
      </label>
      <button
        class="swap-colors"
        type="button"
        aria-label={messages.swapColors}
        on:click={() => ([foreground, background] = [background, foreground])}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 7h12m0 0-3-3m3 3-3 3M17 17H5m0 0 3 3m-3-3 3-3" />
        </svg>
      </button>
      <label>
        <span>{messages.paperColor}</span>
        <input bind:value={background} type="color" aria-label={messages.previewBackgroundColor} />
        <code>{background}</code>
      </label>
    </div>

    <div class="contrast-readout" aria-live="polite">
      <div>
        <strong>{formatMessage(messages.contrastRatio, { ratio: previewContrastRatio.toFixed(2) })}</strong>
        <span class:pass={previewContrastCompliance.normalText}>{messages.normalText}: {previewContrastCompliance.normalText ? messages.pass : messages.fail}</span>
        <span class:pass={previewContrastCompliance.largeText}>{messages.largeText}: {previewContrastCompliance.largeText ? messages.pass : messages.fail}</span>
      </div>
      {#if !previewColorsAreDefault}<button type="button" on:click={restorePreviewColors}>{messages.restoreDefaultColors}</button>{/if}
    </div>

    <label class="coverage-toggle">
      <input bind:checked={onlyComplete} type="checkbox" />
      <span>{messages.completeOnly}</span>
    </label>
  </div>

  <div class="catalog-area" id="catalog" tabindex="-1">
    {#if variationSelectorPattern.test(previewText)}
      <p class="coverage-notice">
        {messages.variationNotice}
      </p>
    {/if}
    <div class="catalog-head">
      <p>{messages.preview}</p>
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
      {#each visibleFamilies as family (`${family.id}:${selectionRevisions[family.id] ?? 0}`)}
        {@const font = fontFor(family)}
        {@const variant = variantFor(font)}
        {@const missingPoints = missing[font.id] ?? []}
        {@const weights = uniqueWeightOptions(font)}
        {@const shapes = shapeOptions(font)}
        {@const weightRange = variableWeightRange(variant)}
        {@const matchTargets = familyMatchTargets(family)}
        {@const officialName = officialNameForLocale(family, locale)}
        {@const activeMatchesFilters = matchTargets.some((target) => target.fontId === font.id && target.variantId === variant.id)}
        <article class="font-specimen">
          <header>
            <div>
              <h3>{family.label}</h3>
              {#if officialName}<p class="official-name" lang={officialName.locale}>{officialName.name}</p>{/if}
              <p class="package-name">{font.packageName}@{font.version}</p>
            </div>
            <div class="specimen-status">
              {#if coveragePending}
                <span class="checking">{messages.checking}</span>
              {:else if missingPoints.length === 0}
                <span class="complete">{messages.complete}</span>
              {:else}
                <span class="missing">{formatMessage(messages.missingCount, { count: missingPoints.length })}</span>
              {/if}
              {#if family.fonts.length > 1}
                <label class="variant-control">
                  <span>{axisLabel(family.axisLabel)}</span>
                  <select bind:value={selectedFontIds[family.id]} aria-label={`${family.label} ${axisLabel(family.axisLabel)}`}>
                    {#each family.fonts as option}
                      <option value={option.id}>{option.family?.valueLabel}{filterMatchIds(option).length > 0 ? ` — ${messages.matchesFilters}` : ""}</option>
                    {/each}
                  </select>
                </label>
              {/if}
              {#if shapes.length > 1}
                <label class="variant-control">
                  <span>{messages.style}</span>
                  <select
                    bind:value={selectedVariants[font.id]}
                    aria-label={`${family.label} ${messages.style}`}
                  >
                    {#each shapes as option}
                      {@const optionId = shapeVariantId(font, option)}
                      <option value={optionId}>{shapeLabel(option)}{filterMatchIds(font).includes(optionId) ? ` — ${messages.matchesFilters}` : ""}</option>
                    {/each}
                  </select>
                </label>
              {/if}
              {#if weightRange}
                <label class="weight-range-control">
                  <span>{messages.weight} <output>{selectedWeights[family.id]}</output></span>
                  <input
                    bind:value={selectedWeights[family.id]}
                    type="range"
                    min={weightRange[0]}
                    max={weightRange[1]}
                    step="1"
                    aria-label={`${family.label} ${messages.weight}`}
                  />
                </label>
              {:else if weights.length > 1}
                <label class="variant-control">
                  <span>{messages.weight}</span>
                  <select
                    bind:value={selectedVariants[font.id]}
                    aria-label={`${family.label} ${messages.weight}`}
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
              {#if hasActiveFilters && matchTargets.length > 0 && !activeMatchesFilters}
                <div class="variant-match-notice">
                  <span>{messages.matchesAnotherVariant}</span>
                  <button type="button" on:click={() => previewFirstMatch(family)}>{messages.previewMatchingVariant}</button>
                </div>
              {/if}
            </div>
          </header>

          <textarea
            class="live-specimen"
            aria-label={formatMessage(messages.specimenLabel, { family: family.label })}
            placeholder={messages.specimenPlaceholder}
            spellcheck="false"
            value={defaultText}
            use:observeSpecimen={family.id}
            on:input={handlePreviewInput}
            on:focus={handlePreviewFocus}
            style:font-family={visibleSpecimenIds.has(family.id)
              ? familyStack(variant, selectedFallback)
              : "inherit"}
            style:--preview-size={`${fontSize}px`}
            style:font-weight={weightRange ? selectedWeights[family.id] : variant.weight}
            style:font-style={variant.style}
            style:font-stretch={variant.stretch}
            style:color={foreground}
            style:background={background}
          ></textarea>

          {#if !coveragePending && missingPoints.length > 0}
            <div class="missing-list" aria-label={messages.missingCharacters}>
              {#each missingPoints.slice(0, 16) as point}
                <span class="missing-glyph" title={formatCodePoint(point)}>{glyph(point)}</span>
              {/each}
              {#if missingPoints.length > 16}<span class="missing-overflow">＋{missingPoints.length - 16}</span>{/if}
            </div>
          {/if}

          <footer>
            <div class="font-facts">
              <span>{variant.label}</span>
              <span>{variant.characterCount.toLocaleString(locale)} {messages.codePoints}</span>
              <span>{font.license}</span>
            </div>
            <div class="usage-code">
              <p>{messages.htmlEmbed}</p>
              <div class="embed-line">
                <code>{embedCode(font, selectedCdn)}</code>
                <button type="button" on:click={() => copyCodeValue(`${font.id}:html`, embedCode(font, selectedCdn))}>
                  {copied === `${font.id}:html` ? messages.copied : messages.copyCode}
                </button>
              </div>
              {#if copyError === `${font.id}:html`}<p class="copy-error" role="alert">{messages.copyFailed}</p>{/if}
              <p>{messages.cssFontFamily}</p>
              <div class="embed-line">
                <code>{fontFamilyCss(variant)}</code>
                <button type="button" on:click={() => copyCodeValue(`${font.id}:css`, fontFamilyCss(variant))}>
                  {copied === `${font.id}:css` ? messages.copied : messages.copyCode}
                </button>
              </div>
              {#if copyError === `${font.id}:css`}<p class="copy-error" role="alert">{messages.copyFailed}</p>{/if}
            </div>
            <nav aria-label={formatMessage(messages.relatedLinks, { family: family.label })}>
              <a href={font.sourceUrl} target="_blank" rel="noreferrer">{messages.upstreamSource}</a>
              <a href={font.repositoryUrl} target="_blank" rel="noreferrer">{messages.packageDocs}</a>
            </nav>
          </footer>
        </article>
      {:else}
        <div class="empty-state">
          {#if (committedQuery.trim() || hasActiveFilters) && queryMatchingFamilies.length === 0}
            <h3>{messages.noSearchTitle}</h3>
            <p>{messages.noSearchBody}</p>
            <button class="empty-action" type="button" on:click={clearSearchAndFilters}>{messages.clearSearchAndFilters}</button>
          {:else if coveragePending}
            <h3>{messages.checkingTitle}</h3>
            <p>{messages.checkingBody}</p>
          {:else if onlyComplete}
            <h3>{messages.noCompleteTitle}</h3>
            <p>{messages.noCompleteBody}</p>
          {:else}
            <h3>{messages.noFontsTitle}</h3>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
