# Fusion Pixel Font webfont

Fusion Pixel Font 2026.08.11 split into WOFF2 files with Unicode ranges. One
package contains all 30 upstream combinations:

- 8px, 10px, and 12px designs
- monospaced and proportional spacing
- Latin, Simplified Chinese, Traditional Chinese, Japanese, and Korean variants

Each combination has a unique CSS family such as
`Fusion Pixel 12px Monospaced Traditional Chinese`.

## CDN

Import all variants:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-fusion-pixel-font@0.0.1/dist/index.css"
/>
```

Import one size and spacing mode:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-fusion-pixel-font@0.0.1/dist/12px/monospaced/index.css"
/>
```

```css
body {
  font-family: "Fusion Pixel 12px Monospaced Traditional Chinese", monospace;
}
```

## Source and license

- Author: TakWolf and Fusion Pixel Font contributors
- Upstream: <https://github.com/TakWolf/fusion-pixel-font>
- Upstream release: 2026.08.11
- Font license: SIL Open Font License 1.1
- Upstream build tooling license: MIT
- Package tooling and documentation license: MIT
- Generated format: WOFF2
- Splitter: `font-splitter v0.2.2`
- Maximum planned bucket size: 1,024 codepoints

See `source.json` for locked release assets and digests, `LICENSE.font.txt` and
`LICENSES` for the upstream font license set, and `LICENSE` for
repository-authored package files.

The npm package contains CSS and WOFF2 assets only. It has no JavaScript runtime.
