# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro with Svelte islands, TypeScript, and static output for GitHub Pages. Astro
owns indexable content and routes. Svelte owns browser-only search, preview, and
preference controls.

## Users

Anyone evaluating or using CJK web fonts. The primary tasks are finding a font,
testing it with real text and presentation settings, and copying a reliable CDN
embed without needing prior knowledge of font tooling.

## Product Purpose

Make the `@vp-tw/cjk-web-fonts-*` catalog searchable, directly comparable, and
safe to integrate. Success means a visitor can confirm that a font supports
their text, understand its variants and license, and copy a version-pinned
embed with minimal effort.

## Positioning

The site is generated from the same versioned font registry and package
artifacts that it documents. Preview, package metadata, CDN embeds, and future
weight or variant filters share one source of truth.

## Operating Context

Visitors may arrive from search, a package page, npm, GitHub, or an AI-assisted
builder. They compare fonts in a browser, paste their own Traditional Chinese,
Simplified Chinese, Japanese, or Korean text, adjust presentation settings, and
copy CSS for a web project.

## Capabilities and Constraints

- Search and preview the complete catalog.
- Edit shared preview text directly in any specimen, then change its font size,
  foreground color, and background color.
- Select light, dark, or system appearance independently from preview colors.
- Show version-pinned embed code for every verified CDN that can serve the npm
  package's CSS and font assets without rewriting the package.
- Preserve static, indexable font content while hydrating only interactive
  controls.
- Keep the interface available after a successful visit. Cache font CSS and
  WOFF2 assets after use instead of downloading the complete catalog.
- Tell visitors when an update is ready, let them defer it, and reload only
  after they choose to update.
- Model weights and variants as data even when a current font has only one.
- Deploy as a static GitHub Pages site under the repository base path.
- Treat package files and upstream license information as authoritative. Do not
  invent availability, performance, or legal claims.

## Brand Commitments

The product name is CJK Web Fonts. Its tagline is “CJK web fonts, ready to
use.” The site must communicate professional, dependable stewardship. Its
design may draw from high-craft printing and type industries, while keeping the
fonts themselves central.

The official mark combines the glyphs `字`, `あ`, and `한` in registration ink
and proof red. Use the approved raster asset without redrawing or recoloring it.
Place it on Specification Paper when the surrounding surface would hide its
black details.

## Evidence on Hand

- `fonts.json` is the package registry.
- `packages/*/package.json` contains package names and versions.
- `packages/*/dist` contains the published CSS and WOFF2 files.
- `packages/*/README.md`, license files, and notices contain source and license
  details.
- No testimonials, usage metrics, customer logos, or performance benchmarks are
  available and none may be fabricated.

## Product Principles

- Let visitors judge fonts with their own content.
- Make integration details exact, pinned, and copyable.
- Keep catalog data auditable and generated from package truth.
- Spend client JavaScript only on interactions that need it.
- Design future weights and variants into the data model before they arrive.

## Accessibility & Inclusion

Meet WCAG 2.2 AA for the interface. Preserve keyboard access, visible focus,
reduced-motion behavior, and usable controls at mobile and desktop sizes.
