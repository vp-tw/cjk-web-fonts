# Adobe NotDef webfont

Adobe NotDef split into WOFF2 files with exact Unicode ranges. It renders each
supported Unicode scalar value as Adobe's official visible `.notdef` glyph.

## CDN

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-adobe-notdef@0.0.1/dist/index.css"
/>
```

## Source and license

- Upstream: <https://github.com/adobe-fonts/adobe-notdef>
- Upstream revision: `1f1f863b2295543598b69bebe42db3e73fe58353`
- Font license: SIL Open Font License 1.1
- Package tooling and documentation license: MIT
- Generated format: WOFF2
- Splitter: `font-splitter v0.2.2`
- Maximum planned bucket size: 16,384 codepoints

See `source.json` for locked source digests, `LICENSE.font.md` for the upstream
license, and `NOTICE.md` for the packaging notice.

The npm package contains CSS and WOFF2 assets only. It has no JavaScript runtime.
