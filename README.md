# CJK Web Fonts

Versioned CJK webfont subsets built with
[font-splitter](https://github.com/VdustR/font-splitter) and served through
jsDelivr's GitHub endpoint.

## Fonts

| Font                                                      | Version    | License | Package                                  |
| --------------------------------------------------------- | ---------- | ------- | ---------------------------------------- |
| [Jigmo](packages/jigmo/README.md)                         | 2025-09-12 | CC0-1.0 | `@vp-tw/cjk-web-fonts-jigmo`             |
| [Hanamin](packages/hanamin/README.md)                     | 2017-09-04 | OFL-1.1 | `@vp-tw/cjk-web-fonts-hanamin`           |
| [Taipei Sans TC](packages/taipei-sans-tc/README.md)       | 1.000      | OFL-1.1 | `@vp-tw/cjk-web-fonts-taipei-sans-tc`    |
| [Fusion Pixel Font](packages/fusion-pixel-font/README.md) | 2026.08.11 | OFL-1.1 | `@vp-tw/cjk-web-fonts-fusion-pixel-font` |

The workspace may later add a GitHub Pages live preview and font search site.
That site is intentionally outside the initial package release.

## Usage

Pin a release tag in production:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-jigmo@0.0.1/dist/index.css"
/>
```

```css
body {
  font-family: "Jigmo", serif;
}
```

The npm packages contain generated WOFF2 files and CSS. Original TTF files and
downloaded archives are excluded.
Each source manifest records the upstream URL, version, SHA-256 digest, and
license.

## Build

Requirements:

- Docker
- Python 3.11 or newer

```sh
./scripts/build-jigmo.sh
./scripts/build-hanamin.sh
./scripts/build-taipei-sans-tc.sh
./scripts/build-fusion-pixel-font.sh
python3 scripts/audit_jigmo.py
python3 scripts/audit_hanamin.py
python3 scripts/audit_taipei_sans_tc.py
python3 scripts/audit_fusion_pixel_font.py
```

The build uses the versioned `vdustr/font-splitter:0.2.2` image. The audit fails
if ordinary cmap codepoints, format 14 variation sequences, CSS coverage, file
count, or conservative CDN size limits do not match the source fonts.

## Release policy

Changesets versions and publishes each font package independently. Do not use an
unpinned jsDelivr URL in production. A release must pass CI and a jsDelivr smoke
test for the exact npm version before existing font repositories redirect users
here.
