<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const updateIntervalMs = 60 * 60 * 1000;
  const activationTimeoutMs = 10 * 1000;

  let registration: ServiceWorkerRegistration | undefined;
  let updateTimer: ReturnType<typeof setInterval> | undefined;
  let offlineReady = false;
  let needRefresh = false;
  let updating = false;
  let updateFailed = false;
  let hasReloaded = false;

  function showInstalledState(worker: ServiceWorker, hadController: boolean): void {
    worker.addEventListener("statechange", () => {
      if (worker.state !== "installed") return;
      if (hadController || navigator.serviceWorker.controller) needRefresh = true;
      else offlineReady = true;
    });
  }

  async function checkForUpdate(): Promise<void> {
    try {
      await registration?.update();
      if (registration?.waiting && navigator.serviceWorker.controller) needRefresh = true;
    } catch {
      // An offline update check is expected to fail; the active worker remains usable.
    }
  }

  async function registerServiceWorker(): Promise<void> {
    if (!("serviceWorker" in navigator)) return;

    try {
      const hadController = Boolean(navigator.serviceWorker.controller);
      registration = await navigator.serviceWorker.register(`${base}sw.js`, { scope: base });

      if (registration.waiting && hadController) needRefresh = true;
      if (registration.installing) showInstalledState(registration.installing, hadController);

      registration.addEventListener("updatefound", () => {
        if (registration?.installing) {
          showInstalledState(registration.installing, Boolean(navigator.serviceWorker.controller));
        }
      });

      updateTimer = setInterval(() => void checkForUpdate(), updateIntervalMs);
    } catch (error) {
      console.error("PWA service worker registration failed", error);
    }
  }

  function close(): void {
    offlineReady = false;
    needRefresh = false;
    updateFailed = false;
  }

  async function applyUpdate(): Promise<void> {
    updating = true;
    updateFailed = false;

    try {
      await registration?.update();
      const waitingWorker = registration?.waiting;
      if (!waitingWorker) throw new Error("Updated service worker is not ready");
      waitingWorker.postMessage({ type: "SKIP_WAITING" });

      window.setTimeout(() => {
        if (hasReloaded) return;
        updating = false;
        updateFailed = true;
      }, activationTimeoutMs);
    } catch (error) {
      console.error("PWA update failed", error);
      updating = false;
      updateFailed = true;
    }
  }

  function reloadWithNewWorker(): void {
    if (hasReloaded) return;
    hasReloaded = true;
    window.location.reload();
  }

  function checkWhenVisible(): void {
    if (document.visibilityState === "visible") void checkForUpdate();
  }

  onMount(() => {
    navigator.serviceWorker?.addEventListener("controllerchange", reloadWithNewWorker);
    document.addEventListener("visibilitychange", checkWhenVisible);
    void registerServiceWorker();

    if (import.meta.env.DEV) {
      const preview = new URLSearchParams(window.location.search).get("pwa-prompt");
      if (preview === "update") needRefresh = true;
      if (preview === "offline") offlineReady = true;
      if (preview === "error") {
        needRefresh = true;
        updateFailed = true;
      }
    }
  });

  onDestroy(() => {
    navigator.serviceWorker?.removeEventListener("controllerchange", reloadWithNewWorker);
    document.removeEventListener("visibilitychange", checkWhenVisible);
    if (updateTimer) clearInterval(updateTimer);
  });

  $: visible = offlineReady || needRefresh;
</script>

{#if visible}
  <aside
    class="pwa-notice"
    aria-atomic="true"
    aria-live={updateFailed ? "assertive" : "polite"}
    role={updateFailed ? "alert" : "status"}
  >
    <div class="pwa-notice__index" aria-hidden="true">
      {needRefresh ? "REV / 002" : "LOCAL / 001"}
    </div>

    <div class="pwa-notice__message">
      <strong>{updateFailed ? "更新未完成" : needRefresh ? "有新版可用" : "已可離線使用"}</strong>
      <span>
        {updateFailed
          ? "請再試一次；若仍無法更新，請重新整理頁面。"
          : needRefresh
            ? "更新已下載完成。重新載入即可使用最新版本。"
            : "網站介面已可在離線時開啟；字型會在使用後逐步保留。"}
      </span>
    </div>

    <div class="pwa-notice__actions">
      {#if needRefresh}
        <button class="pwa-notice__primary" type="button" disabled={updating} on:click={applyUpdate}>
          {updating ? "正在更新…" : updateFailed ? "再試一次" : "立即更新"}
        </button>
        <button type="button" disabled={updating} on:click={close}>稍後</button>
      {:else}
        <button class="pwa-notice__primary" type="button" on:click={close}>知道了</button>
      {/if}
    </div>
  </aside>
{/if}

<style>
  .pwa-notice {
    position: fixed;
    right: 3vw;
    bottom: 3vw;
    z-index: 20;
    display: grid;
    grid-template-columns: 2.75rem minmax(0, 1fr);
    width: min(42rem, calc(100vw - 6vw));
    border: 1px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
  }

  .pwa-notice__index {
    grid-row: 1 / 3;
    padding: 1rem 0.8rem;
    border-right: 1px solid var(--ink);
    color: var(--accent);
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    writing-mode: vertical-rl;
  }

  .pwa-notice__message {
    display: grid;
    gap: 0.35rem;
    padding: 1rem 1.1rem;
  }

  .pwa-notice__message strong {
    font-size: 1rem;
    font-weight: 700;
  }

  .pwa-notice__message span {
    color: var(--muted);
    line-height: 1.5;
  }

  .pwa-notice__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-top: 1px solid var(--ink);
  }

  .pwa-notice__actions:has(> :only-child) {
    grid-template-columns: 1fr;
  }

  .pwa-notice button {
    min-height: 44px;
    padding: 0.7rem 1rem;
    border: 0;
    background: var(--paper);
    color: var(--ink);
    font-weight: 700;
  }

  .pwa-notice button + button {
    border-left: 1px solid var(--ink);
  }

  .pwa-notice button:hover:not(:disabled) {
    background: var(--paper-raised);
  }

  .pwa-notice button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .pwa-notice button:focus-visible {
    outline-offset: -3px;
  }

  .pwa-notice .pwa-notice__primary {
    background: var(--ink);
    color: var(--paper);
  }

  .pwa-notice .pwa-notice__primary:hover:not(:disabled) {
    background: var(--accent);
    color: var(--accent-ink);
  }

  @media (max-width: 600px) {
    .pwa-notice {
      right: 0;
      bottom: 0;
      left: 0;
      grid-template-columns: 2.25rem minmax(0, 1fr);
      width: 100%;
      border-right: 0;
      border-bottom: 0;
      border-left: 0;
    }

    .pwa-notice__index {
      padding-inline: 0.65rem;
    }

    .pwa-notice__message {
      padding: 0.9rem;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .pwa-notice {
      animation: pwa-notice-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes pwa-notice-in {
      from {
        clip-path: inset(100% 0 0);
      }
      to {
        clip-path: inset(0);
      }
    }
  }
</style>
