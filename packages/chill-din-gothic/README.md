# ChillDINGothic webfont

`@vp-tw/cjk-web-fonts-chill-din-gothic` contains ChillDINGothic Std 1.300
(寒蝉德黑体 / 寒蟬德黑體) as Unicode-range WOFF2 subsets. Its DIN-inspired
Latin forms are paired with Chinese forms derived from ChillDuanSans
(Source Han Sans), with adjusted metrics and punctuation.

## CDN

The first release is 0.0.1. After publication:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-chill-din-gothic@0.0.1/dist/index.css"
/>
```

```css
body {
  font-family: "VP Industrial Gothic", sans-serif;
  font-weight: 500;
}
```

The upstream style is named Regular but its OS/2 weight class is 500. This
package preserves that weight rather than advertising a nonexistent 400 face.
The CSS and internal font family are renamed to `VP Industrial Gothic` because
the upstream license reserves ChillDIN and ChillDINGothic, and pre-subsetting
creates modified font software. See the [OFL webfont guidance](https://openfontlicense.org/webfonts-and-reserved-font-names/).
The catalog retains the upstream names for discovery and attribution.

## Source and license

- Upstream: [ChillDIN / ChillDINGothic](https://github.com/Warren2060/ChillDIN-ChillDINGothic)
- Upstream version: ChillDINGothic Std 1.300
- Source: `ChillDINGothic v1.300_Std/ChillDINGothic_Std.otf`; pinned commit and
  SHA-256 checksums are recorded in [source.json](source.json).
- Font license: SIL Open Font License 1.1
- Package tooling and documentation license: MIT
- Generated format: WOFF2
- Splitter: `font-splitter v0.2.2`

All 30,545 encoded code points are retained across the subsets. Character
coverage does not establish regional language suitability; the catalog makes
no reviewed regional-language claim for this package.

The separate ChillDIN 1.100 Latin family is not included. Its static widths
and variable font are not variants of the Chinese ChillDINGothic Std font.

The npm package contains CSS and WOFF2 assets only. It has no JavaScript runtime.
