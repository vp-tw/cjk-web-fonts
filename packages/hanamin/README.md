# Hanamin webfont

Hanamin 2017-09-04 split into WOFF2 files with Unicode ranges. HanaMinA and
HanaMinB use the shared web family name `HanaMin`.

## CDN

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-hanamin@0.0.1/dist/index.css"
/>
```

## Source and license

- Author: Koichi Kamichi and GlyphWiki contributors
- Upstream: <https://glyphwiki.org/hanazono/>
- Upstream version: 2017-09-04
- Font license: SIL Open Font License 1.1
- Package tooling and documentation license: MIT
- Generated format: WOFF2
- Splitter: `font-splitter v0.2.2`
- Maximum planned bucket size: 1,024 codepoints

The upstream archive offers a custom license and OFL-1.1 as alternatives. This
package redistributes the font under OFL-1.1. See `source.json` for the locked
download digest, `LICENSE.font.txt` for the complete upstream license text, and
`LICENSE` for repository-authored package files.

The npm package contains CSS and WOFF2 assets only. It has no JavaScript runtime.
