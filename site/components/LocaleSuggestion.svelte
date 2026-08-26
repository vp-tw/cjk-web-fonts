<script lang="ts">
  import { onMount } from "svelte";

  import { detectLocale, formatMessage, localeNames, localePath, type Messages } from "../lib/i18n";

  export let base: string;
  export let copy: Messages["localeSuggestion"];

  let suggestedLocale: ReturnType<typeof detectLocale> | null = null;

  onMount(() => {
    const stored = localStorage.getItem("cjk-locale");
    const candidate = stored
      ? detectLocale([stored])
      : detectLocale(navigator.languages.length > 0 ? navigator.languages : [navigator.language]);
    if (candidate !== "en" && localStorage.getItem("cjk-locale-dismissed") !== candidate) {
      suggestedLocale = candidate;
    }
  });

  function accept(): void {
    if (!suggestedLocale) return;
    localStorage.setItem("cjk-locale", suggestedLocale);
  }

  function dismiss(): void {
    if (suggestedLocale) localStorage.setItem("cjk-locale-dismissed", suggestedLocale);
    suggestedLocale = null;
  }
</script>

{#if suggestedLocale}
  <aside class="locale-suggestion" aria-label={copy.message.replace("{language}", localeNames[suggestedLocale])}>
    <p>{formatMessage(copy.message, { language: localeNames[suggestedLocale] })}</p>
    <div>
      <a href={localePath(suggestedLocale, base)} on:click={accept}>
        {formatMessage(copy.switch, { language: localeNames[suggestedLocale] })}
      </a>
      <button type="button" on:click={dismiss}>{copy.dismiss}</button>
    </div>
  </aside>
{/if}

<style>
  .locale-suggestion {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem 2rem;
    padding: 0.75rem 3vw;
    border-bottom: 1px solid var(--ink);
    background: var(--paper-raised);
    color: var(--ink);
    font-size: 1rem;
  }

  p {
    margin: 0;
  }

  div {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  a,
  button {
    white-space: nowrap;
  }

  a {
    font-weight: 700;
  }

  button {
    min-height: 38px;
    padding: 0 0.75rem;
    border: 1px solid var(--rule);
    background: var(--paper);
    color: var(--ink);
  }

  @media (max-width: 600px) {
    .locale-suggestion {
      align-items: stretch;
      flex-direction: column;
    }

    div {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
    }

    a {
      white-space: normal;
    }

    button {
      min-height: 44px;
    }
  }
</style>
