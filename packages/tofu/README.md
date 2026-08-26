# Tofu webfont

Google Fonts Tofu split into browser-compatible WOFF2 files with Unicode ranges.
The published subsets preserve the upstream glyph while replacing its cmap format
13 mapping with format 12 for web fallback compatibility.

## CDN

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-tofu@0.0.1/dist/index.css"
/>
```

## Source and license

- Upstream: <https://github.com/googlefonts/tofu>
- Upstream revision: `ee763685d7b0c4a84bd0ff113b2000b1b50865a9`
- Font license: Apache License 2.0
- Package tooling and documentation license: MIT
- Generated format: WOFF2 with cmap format 12
- Splitter: `font-splitter v0.2.2`
- Maximum planned bucket size: 16,384 codepoints

See `source.json` for the locked archive digest, `LICENSE.font.txt` for the
upstream license, and `NOTICE.md` for the modification notice.

The npm package contains CSS and WOFF2 assets only. It has no JavaScript runtime.
