# Last Resort webfont

Unicode Last Resort 17.000 split into WOFF2 files with exact Unicode ranges.
Its diagnostic glyphs identify the Unicode block or special codepoint category
of a missing character.

## CDN

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-last-resort@0.0.1/dist/index.css"
/>
```

## Source and license

- Upstream: <https://github.com/unicode-org/last-resort-font>
- Upstream release: `17.000` for Unicode 17.0.0
- Upstream revision: `172cdf6d01e2a70cdd716ec04464860e44d06728`
- Font license: SIL Open Font License 1.1
- Package tooling and documentation license: MIT
- Generated format: WOFF2 from the official cmap format 12 TTF
- Splitter: `font-splitter v0.2.2`
- Maximum planned bucket size: 16,384 codepoints

See `source.json` for locked source digests, `LICENSE.font.txt` for the upstream
license, and `NOTICE.md` for the packaging notice.

The npm package contains CSS and WOFF2 assets only. It has no JavaScript runtime.
