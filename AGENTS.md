# Repository instructions

## Source of truth

`fonts.json` is the font package registry. Read it before changing packages,
build scripts, audits, or CI. Do not maintain a separate hard-coded font list.

Each font entry owns:

- `packages/<id>`
- one build script
- one audit script
- the corresponding root `build:<id>` command

Related packages may declare `buildInputs` for shared helpers. The CI selector
must include those paths so a helper change rebuilds every dependent package
without rebuilding unrelated fonts.

Run `pnpm validate:workspace` after changing this structure. The validator
rejects unregistered packages, missing scripts, incomplete README entries, root
build drift, and release commands that rebuild fonts.

## Package delivery limits

`package-size-policy.json` is the source of truth for CDN evidence and repository
budgets. `pnpm audit:packages` measures the actual npm tarball, unpacked package,
and largest published file through `npm pack --dry-run --json`. Do not estimate
package size from `dist` or WOFF2 totals.

Every CI run audits all publishable packages, including package metadata-only
changes, without rebuilding fonts. CI also audits each affected package after
rebuilding it. The release workflow audits all packages before Changesets can
publish. Do not add the policy or generic audit to `commonBuildInputs`: a size
rule change must run the fast package audit without triggering every expensive
font build. Do not add a package-specific size constant or bypass. A provider
without a published numeric limit remains `null`; do not turn an assumption
into a limit.

When any budget fails, split the family by a stable user-facing delivery
dimension before publishing. A policy exception requires explicit maintainer
approval, a reason, and an expiry date; the current schema intentionally has no
exception mechanism.

## Build and release boundary

Generated `dist` files are committed. A feature PR must rebuild every affected
font, run its audit, and pass `git diff --exit-code`. The release workflow
publishes those reviewed files and must not rebuild them.

`release:publish` must remain exactly `changeset publish`. A release rebuild is
slow and provides no additional verification after the PR generated-file gate.

CI selects affected fonts from `fonts.json`. Changes to a source manifest,
generated `dist` file, build or audit script, or any `commonBuildInputs` entry
trigger the required font jobs.
Use the manual full-rebuild workflow when an uncached audit of every font is
needed.

## Adding a font

1. Add the package, locked source manifest, generated `dist`, license files,
   README, build script, and audit script.
2. Add one entry to `fonts.json`.
3. Add the matching root `build:<id>` command and append it to root `build`.
4. Add the package to the root README and create a Changeset.
5. Run `pnpm validate:workspace`, `pnpm check`, and the font build twice.
6. Run `pnpm audit:packages -- <id>` and confirm the second build produces no Git diff.

Repository-authored files use MIT. Font software and generated subsets retain
their upstream licenses. Packages contain no JavaScript runtime.

Split a large static family by a stable delivery dimension such as width when a
single npm package would approach the package audit budget. Keep every upstream
variant represented in `fonts.json`, preserve CSS weight and stretch metadata,
and set each unpublished package manifest to `0.0.0`. Add a patch changeset so
the first published version is `0.0.1`.

Multi-variant builds should use bounded parallelism. The Glow Sans helper builds
four variants at a time by default; set `FONT_BUILD_CONCURRENCY` to a positive
integer only when runner resources require a different limit. Use
`FONT_BUILD_CONCURRENCY=2` when all five width packages are built concurrently
on an 8-core workstation.

## Catalog website

The GitHub Pages site uses Astro for static content and a Svelte island for the
interactive catalog. `fonts.json` also owns public descriptions, sources,
licenses, variants, CSS entry points, and coverage inputs.

Read `PRODUCT.md` and `DESIGN.md` before changing the catalog interface.
`.impeccable/design.json` is the machine-readable design contract. Keep all
three synchronized when a reviewed design decision changes.

`pnpm site:data` generates `site/generated/fonts.json` from package metadata and
published CSS `unicode-range` descriptors. Never edit the generated file by
hand. `pnpm site:data:check` rejects stale output, and `pnpm check` includes the
generator check, unit tests, Astro diagnostics, Oxlint, and Oxfmt.

Use `pnpm site:dev` for local development, `pnpm site:build` for the production
static build, and `pnpm site:preview` to inspect that build under the GitHub
Pages base path. Coverage checks run locally in a Web Worker; pasted text is not
sent to a server. Unicode variation selectors are reported separately because
the browser index currently validates base code points while the package audits
remain authoritative for variation sequences.

`pnpm site:build` also runs `scripts/build_pwa.mjs`. The build must precache the
GitHub Pages navigation fallback and fails on Workbox warnings so an oversized
app shell cannot silently lose offline support. Keep the manifest, Astro base,
service worker scope, and navigation fallback at `/cjk-web-fonts/`.

The service worker precaches the app shell only. It caches CDN font CSS and
WOFF2 files after use; do not precache complete font packages. Updates must wait
for the visitor to choose `立即更新`, then activate and reload once. In local
development, use `?pwa-prompt=update`, `?pwa-prompt=offline`, or
`?pwa-prompt=error` to review prompt states. Before changing the update flow,
verify it against two consecutive production builds and test a controlled
offline reload.
