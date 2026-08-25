import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://vp-tw.github.io",
  base: "/cjk-web-fonts/",
  outDir: "./site-dist",
  srcDir: "./site",
  integrations: [svelte()],
});
