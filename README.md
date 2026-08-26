# CJK Web Fonts

CJK web fonts, ready to use.

This monorepo builds versioned CJK web font subsets with
[font-splitter](https://github.com/VdustR/font-splitter) and serves them through
jsDelivr's GitHub endpoint.

## Fonts

| Font                                                                        | Version    | License | Package                                        |
| --------------------------------------------------------------------------- | ---------- | ------- | ---------------------------------------------- |
| [Jigmo](packages/jigmo/README.md)                                           | 2025-09-12 | CC0-1.0 | `@vp-tw/cjk-web-fonts-jigmo`                   |
| [Hanamin](packages/hanamin/README.md)                                       | 2017-09-04 | OFL-1.1 | `@vp-tw/cjk-web-fonts-hanamin`                 |
| [Taipei Sans TC](packages/taipei-sans-tc/README.md)                         | 1.000      | OFL-1.1 | `@vp-tw/cjk-web-fonts-taipei-sans-tc`          |
| [Fusion Pixel Font](packages/fusion-pixel-font/README.md)                   | 2026.08.11 | OFL-1.1 | `@vp-tw/cjk-web-fonts-fusion-pixel-font`       |
| [Wêlai Glow Sans TC Compressed](packages/glow-sans-tc-compressed/README.md) | 0.93       | OFL-1.1 | `@vp-tw/cjk-web-fonts-glow-sans-tc-compressed` |
| [Wêlai Glow Sans TC Condensed](packages/glow-sans-tc-condensed/README.md)   | 0.93       | OFL-1.1 | `@vp-tw/cjk-web-fonts-glow-sans-tc-condensed`  |
| [Wêlai Glow Sans TC Normal](packages/glow-sans-tc-normal/README.md)         | 0.93       | OFL-1.1 | `@vp-tw/cjk-web-fonts-glow-sans-tc-normal`     |
| [Wêlai Glow Sans TC Extended](packages/glow-sans-tc-extended/README.md)     | 0.93       | OFL-1.1 | `@vp-tw/cjk-web-fonts-glow-sans-tc-extended`   |
| [Wêlai Glow Sans TC Wide](packages/glow-sans-tc-wide/README.md)             | 0.93       | OFL-1.1 | `@vp-tw/cjk-web-fonts-glow-sans-tc-wide`       |
| [Iansui](packages/iansui/README.md)                                         | 1.020      | OFL-1.1 | `@vp-tw/cjk-web-fonts-iansui`                  |
| [LXGW WenKai TC](packages/lxgw-wenkai-tc/README.md)                         | 1.522      | OFL-1.1 | `@vp-tw/cjk-web-fonts-lxgw-wenkai-tc`          |
| [Chiron Sung HK](packages/chiron-sung-hk/README.md)                         | 1.024      | OFL-1.1 | `@vp-tw/cjk-web-fonts-chiron-sung-hk`          |
| [Chiron Hei HK](packages/chiron-hei-hk/README.md)                           | 2.609      | OFL-1.1 | `@vp-tw/cjk-web-fonts-chiron-hei-hk`           |

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
./scripts/build-glow-sans-tc-normal.sh
python3 scripts/audit_jigmo.py
python3 scripts/audit_hanamin.py
python3 scripts/audit_taipei_sans_tc.py
python3 scripts/audit_fusion_pixel_font.py
```

Glow Sans builds four weights concurrently. Set `FONT_BUILD_CONCURRENCY` to a
positive integer to match the available CPU and memory when needed.
For a concurrent rebuild of all five width packages on an 8-core workstation,
use `FONT_BUILD_CONCURRENCY=2`.

The build uses the versioned `vdustr/font-splitter:0.2.2` image. The audit fails
if ordinary cmap codepoints, format 14 variation sequences, CSS coverage, file
count, or conservative CDN size limits do not match the source fonts.

`fonts.json` is the package registry used by CI and workspace validation. Run
the same checks locally with:

```sh
pnpm validate:workspace
pnpm test:workspace-tools
pnpm audit:packages
pnpm check
```

`pnpm audit:packages` inspects the exact files and sizes reported by
`npm pack --dry-run --json`. The versioned policy in
`package-size-policy.json` keeps the tarball below jsDelivr's documented default
150 MB package limit with repository headroom. Its 20 MB file budget also stays
below Statically's documented 25 MB file limit. Providers without official
numeric limits remain listed as unknown rather than receiving assumed limits.
Every CI run audits all package metadata and current artifacts without rebuilding
fonts. Affected packages are audited again after their generated files are
rebuilt, and the release workflow audits every package before publishing.

Pull requests rebuild only fonts affected by source manifests, generated files,
or their build and audit scripts. A font entry can declare `buildInputs` for a
helper shared by related packages; changing that helper selects only those
packages. Changes to `commonBuildInputs` rebuild every font. The
registry file itself contains catalog and orchestration metadata, so changing
`fonts.json` alone does not rebuild generated font artifacts. The
`Full font rebuild` workflow provides a manual uncached audit of the entire
repository.

## Release policy

Changesets versions and publishes each font package independently. Do not use an
unpinned jsDelivr URL in production. A release must pass CI and a jsDelivr smoke
test for the exact npm version before existing font repositories redirect users
here.

Generated `dist` files are committed and verified in pull requests. Releases
publish those reviewed files directly; the release workflow must not rebuild
fonts.

## Catalog website

The Astro and Svelte GitHub Pages site provides searchable live specimens,
long-text Unicode coverage filtering, variant controls, preview colors and
sizes, light/dark/system appearance, and exact-version embed code for jsDelivr,
UNPKG, and Statically.

```sh
pnpm site:data
pnpm site:dev
pnpm site:build
```

Catalog metadata lives in `fonts.json`. `site/generated/fonts.json` is generated
from package metadata and published CSS coverage; do not edit it directly.
