import { access, readFile } from "node:fs/promises";
import { generateSW } from "workbox-build";

const base = "/cjk-web-fonts/";
const outputDirectory = "site-dist";
const serviceWorkerPath = `${outputDirectory}/sw.js`;

const { count, size, warnings } = await generateSW({
  globDirectory: outputDirectory,
  globPatterns: [
    "index.html",
    "manifest.webmanifest",
    "favicon.ico",
    "brand/apple-touch-icon.png",
    "brand/favicon-*.png",
    "brand/icon-*.png",
    "brand/logo-64.png",
    "_astro/**/*.{js,css}",
  ],
  modifyURLPrefix: { "": base },
  swDest: serviceWorkerPath,
  sourcemap: false,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  navigateFallback: `${base}index.html`,
  navigateFallbackAllowlist: [/^\/cjk-web-fonts(?:\/|$)/],
  cleanupOutdatedCaches: true,
  clientsClaim: false,
  skipWaiting: false,
  dontCacheBustURLsMatching: /-[A-Za-z0-9_-]{8}\.(?:js|css)$/,
  runtimeCaching: [
    {
      urlPattern:
        /^https:\/\/(?:cdn\.jsdelivr\.net|unpkg\.com|cdn\.statically\.io)\/.*\.css(?:\?.*)?$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "cjk-font-styles",
        cacheableResponse: { statuses: [0, 200] },
        expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern:
        /^https:\/\/(?:cdn\.jsdelivr\.net|unpkg\.com|cdn\.statically\.io)\/.*\.woff2(?:\?.*)?$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "cjk-font-files",
        cacheableResponse: { statuses: [0, 200] },
        expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 90 },
      },
    },
  ],
});

if (warnings.length > 0) {
  throw new Error(`PWA build warnings must be resolved:\n${warnings.join("\n")}`);
}
if (count === 0) throw new Error("PWA build produced an empty precache manifest");

await access(serviceWorkerPath);
const serviceWorker = await readFile(serviceWorkerPath, "utf8");
if (!serviceWorker.includes(JSON.stringify(`${base}index.html`))) {
  throw new Error("PWA service worker must precache the offline navigation fallback");
}

const manifest = JSON.parse(await readFile(`${outputDirectory}/manifest.webmanifest`, "utf8"));
if (manifest.start_url !== base || manifest.scope !== base) {
  throw new Error("PWA manifest start_url and scope must match the GitHub Pages base path");
}

console.log(`generated PWA service worker: ${count} files, ${size} bytes precached`);
