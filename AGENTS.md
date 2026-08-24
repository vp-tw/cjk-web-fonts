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
6. Confirm the second build produces no Git diff.

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
