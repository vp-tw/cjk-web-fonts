# Jigmo webfont

Jigmo 2025-09-12 split into WOFF2 files with Unicode ranges. The three upstream
font files use the shared web family name `Jigmo`, so consumers need one CSS
family across the BMP, SIP, and TIP subsets.

## CDN

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-jigmo@0.0.1/dist/index.css"
/>
```

## Source and license

- Author: Koichi Kamichi and GlyphWiki contributors
- Upstream: <https://kamichikoichi.github.io/jigmo/>
- Upstream version: 2025-09-12
- Font license: CC0 1.0
- Package tooling and documentation license: MIT
- Generated format: WOFF2
- Splitter: `font-splitter v0.2.2`
- Maximum planned bucket size: 1,024 codepoints

See `source.json` for the locked download digest, `LICENSE.font.txt` for the
license shipped with the upstream archive, and `LICENSE` for repository-authored
package files.

The npm package contains CSS and WOFF2 assets only. It has no JavaScript runtime.
