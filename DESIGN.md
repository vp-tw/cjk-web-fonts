---
name: CJK Web Fonts
description: A calm, exacting type-specimen system for testing and specifying CJK web fonts.
colors:
  specification-paper: "#e7e3d8"
  raised-paper: "#f1eee6"
  registration-ink: "#171816"
  secondary-ink: "#60655f"
  hairline-rule: "#9a9c94"
  control-rule: "#747870"
  proof-red: "#c84125"
  reversed-paper: "#fff8ef"
  verified-green: "#1e6650"
  missing-red: "#a63224"
  focus-blue: "#0b69a3"
  selection-rose: "#d6a89d"
typography:
  display:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(2.4rem, 5vw, 5.4rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  body:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: "ui-monospace, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
rounded:
  square: "0"
  circular: "50%"
spacing:
  hairline: "1px"
  compact: "0.5rem"
  control: "1rem"
  section: "3vw"
components:
  input:
    backgroundColor: "{colors.specification-paper}"
    textColor: "{colors.registration-ink}"
    rounded: "{rounded.square}"
    padding: "0 0.7rem"
    height: "42px"
  segment-selected:
    backgroundColor: "{colors.registration-ink}"
    textColor: "{colors.specification-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    height: "38px"
  proof-preset-selected:
    backgroundColor: "{colors.registration-ink}"
    textColor: "{colors.specification-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    height: "38px"
  embed-action:
    backgroundColor: "{colors.registration-ink}"
    textColor: "{colors.specification-paper}"
    rounded: "{rounded.square}"
    width: "110px"
  embed-action-hover:
    backgroundColor: "{colors.proof-red}"
    textColor: "{colors.reversed-paper}"
    rounded: "{rounded.square}"
---

# Design System: CJK Web Fonts

## Overview

**Creative North Star: "The Standards Manual"**

CJK Web Fonts feels like an international typographic standards manual opened on a press-room desk. The interface is calm, exact, and visibly maintained. Warm specification paper, registration ink, numbered controls, and hairline rules give each decision a traceable place without competing with the type specimens.

The product is an operating surface, not a promotional page. Editable text and calibrated controls lead; package, coverage, license, source, and CDN facts remain attached to the specimen they describe. The visual system avoids decorative print effects that do not support a task.

**Key Characteristics:**

- Warm paper fields with high-contrast ink and sparse proof-red emphasis.
- Square controls, continuous rules, and measured typographic spacing.
- Large live specimens paired with compact technical metadata.
- Explicit states and literal labels instead of ornamental marks.
- Package and delivery relationships remain visibly traceable.

## Colors

The palette reproduces an uncoated specification sheet: warm neutrals carry the work, near-black ink defines structure, and one proofing color marks attention.

### Primary

- **Proof Red:** Reserved for active proofing cues, result counts, and hover emphasis. Its scarcity gives it authority.

### Neutral

- **Specification Paper:** The main light-mode field and the reference preview stock.
- **Raised Paper:** A slight tonal lift for control rails and embed-code rows.
- **Registration Ink:** Primary text, structural rules, and selected controls.
- **Secondary Ink:** Supporting copy, labels, and technical metadata.
- **Hairline Rule:** Low-emphasis dividers and field borders.
- **Reversed Paper:** Legible text over Proof Red.

### Semantic

- **Verified Green:** A font covers every checked code point.
- **Missing Red:** Coverage is incomplete or missing glyphs are listed.
- **Focus Blue:** Keyboard focus only; it remains distinct from proofing and status colors.
- **Selection Rose:** Text-selection feedback on paper-colored fields.

Dark mode reverses the material relationship with charcoal paper, warm white ink, lighter rules, and brighter semantic colors. It preserves roles and contrast rather than mechanically inverting the light palette.

**The One Proof Ink Rule.** Proof Red is the only general accent. Do not introduce additional decorative accent colors.

**The Status Is Evidence Rule.** Green and Missing Red communicate verified coverage states only; never use them as general decoration.

## Typography

**Display Font:** The operating-system UI sans stack
**Body Font:** The operating-system UI sans stack
**Label/Mono Font:** The interface sans for labels; the system monospace stack for package names, code, and character counts.

**Character:** The local UI sans keeps the interface neutral and responsive without loading a catalog font into every control. Scale, spacing, case, and numeric alignment create hierarchy; downloaded font switching is reserved for visible user-selected specimens.

### Hierarchy

- **Display** (400, fluid from 2.4rem to 5.4rem, 0.98 line height): The primary task statement. Keep it concise and allow a tight editorial silhouette.
- **Body** (400, 1rem, 1.5 line height): Instructions and explanatory copy, normally kept near 55 characters per line.
- **Title** (500, 1.35rem): Font names and specimen-level headings.
- **Label** (400, 0.72rem, compact): Controls, facts, statuses, and technical annotations. Numeric labels use tabular figures where comparison matters.
- **Code** (400, 0.72rem, system monospace): Package identifiers and copyable embed markup.

**The Specimen Owns the Typeface Rule.** Interface typography stays neutral. Catalog fonts appear in live specimen regions, never in navigation or controls.

**The Data Stays Compact Rule.** Technical metadata may be small, but must retain readable contrast, explicit units, and complete package identifiers.

## Layout

The base composition is a two-column workbench. A narrow specification rail holds search and proof controls; the fluid field begins with a compact task statement and then moves directly into editable font specimens. One-pixel rules join regions into a continuous sheet instead of separating them into floating cards.

Page edges and specimen interiors use a fluid section inset (`3vw`). Major proof regions scale with `clamp()` while control dimensions remain stable. Dense metadata wraps instead of truncating.

At 900px and below, the control rail stops being sticky and becomes a two-column calibration panel before the catalog. At 600px and below, controls become a single column, headers stack, embed actions occupy their own full-width row, and specimen type is capped at 12vw to prevent horizontal overflow.

**The Specimen Is the Input Rule.** Preview text is edited in context. Do not add a separate master-proof field above the catalog.

## Elevation & Depth

The system is flat. It uses no shadows. Depth comes from paper-tone changes, one-pixel rules, and sticky positioning where a persistent control surface is operationally useful.

**The Printed Plane Rule.** Do not use drop shadows, glass effects, bevels, or simulated paper texture. A region earns separation through structure and tone.

## Shapes

Rectangles are square and rules are thin. Text fields, selects, proof areas, status labels, embed rows, and specimen containers use zero radius. The only circular control is the compact foreground/background swap action, whose silhouette communicates reversal rather than a new container style.

**The Square Instrument Rule.** Keep operational fields and containers square. Circular geometry is reserved for the swap control or a semantically circular mark.

## Components

### Navigation

- **Style:** A ruled header with the approved CJK brand mark, compact wordmark, official tagline, and literal text links. Render the raster mark at 40px inside a 44px Specification Paper field so its registration-ink details remain visible in every color mode. Resize or convert the approved asset only; do not redraw, recolor, or add effects.
- **State:** Links use the global underline and keyboard-focus treatment. On narrow screens, the task link remains visible while the external repository link may be hidden.
- **Language:** A literal native-language label opens ruled links to every static locale. English is the root and fallback. Browser-language detection may offer a dismissible switch below the header on the English root, but never redirects automatically or changes proof content.

### Social Preview

- **Style:** The approved Open Graph raster uses a warm Specification Paper field, oversized neutral sans typography, one Proof Red rule, the CJK brand mark, and compact repository metadata. It carries the official tagline verbatim.
- **Asset:** Keep the generated source alongside the 1200×630 delivery image. The delivery image may be resized only; do not redraw, recolor, sharpen, or add effects.

### Inputs / Fields

- **Style:** Paper background, one-pixel Hairline Rule border, square corners, and a stable minimum height of 42px.
- **Focus:** A two-pixel Focus Blue outline with clear offset. Segmented radio options place the outline inside the group so it is never clipped.
- **Text Area:** Every specimen owns a large, resizable textarea. Editing any specimen synchronizes the shared proof text; preview foreground, background, and selected typeface apply directly to that field.
- **Preview contrast:** A compact ruled calibration readout follows the foreground and background controls. It reports the exact contrast ratio plus literal normal-text and large-text WCAG AA pass/fail states in a polite live region. Low-contrast proof colors remain valid and unchanged. When colors differ from Registration Ink on Specification Paper, a square Restore defaults action resets only the two preview colors.
- **Missing-glyph fallback:** A compact select in the calibration rail offers System Default, Tofu, Adobe NotDef, and Last Resort. It applies only to live specimens. Coverage evidence, package selection, and copied embed code remain unchanged.
- **Font filters:** A collapsed disclosure beside search contains native checkbox groups for Font type, Language suitability, and Character support. Each legend states its matching rule: any selected type may match, while every selected language and character set must match. Its summary reports the active condition count and an in-panel action clears every filter. Font types use Fontsource classification values plus the repository-specific Diagnostic fallback role. Facets combine with AND. Type and complete writing-system conditions must match the same variant, while reviewed language suitability remains package-level metadata. Filter rows align a 16px native checkbox column with the text column; selected rows reverse to Registration Ink without adding Proof Red as a second selection signal. Essential control boundaries use Control Rule, while Hairline Rule remains structural. At 600px and below, a full-width View results action reports the live family count, closes the disclosure, and moves focus to the catalog without changing filter state; reduced-motion preferences disable smooth scrolling.
- **Variant match notice:** Filtering never changes the active package or variant. When another variant is responsible for a family match, append “matches filters” to relevant native select options and show one compact ruled notice with an explicit Preview matching style button. The action may update both package and variant, after which preview and embed output follow the new active selection.

### Segmented Controls

- **Style:** Three equal cells share one outer rule. Dividers are continuous and labels remain compact.
- **State:** The selected cell reverses to Registration Ink over Specification Paper. State cannot rely on accent color alone.

### Proof Presets

- **Style:** A continuous ruled field contains compact square buttons. One-pixel gaps preserve the Standards Manual grid, and selected buttons reverse to Registration Ink over Specification Paper.
- **Content:** Keep the curated presets in this order: Latin, symbols, Bopomofo, Japanese, Korean, Cantonese, Traditional Chinese, Simplified Chinese, and rare characters. `All` is an independent state rather than a tenth selected preset.
- **Behavior:** Presets are multi-select. Choosing one or more presets regenerates the shared proof in the curated order. Deselecting the final preset returns to `All`. Direct editing in any specimen changes the control to a custom state without replacing the edited proof.
- **Summary:** For `All` or preset selections, report the selected preset count and unique required code-point count in a polite live region. For direct edits, report the literal custom-content state.
- **Responsive:** Buttons have a 38px minimum height on wider layouts and a 44px minimum height at 600px and below. Keyboard focus uses the inset Focus Blue outline.

### Status Labels

- **Style:** Plain text inside a one-pixel border in the matching semantic color.
- **State:** Checking, complete, and missing states use literal labels in the active interface language. Missing-glyph details remain adjacent to the affected specimen. Each displayed missing glyph uses a square semantic rule; an overflow count such as `＋30` is an unboxed summary because it is not itself a glyph.

### Font Specimens

- **Style:** Each font is a full-width ruled section, not a card. Its header keeps name, exact package version, coverage state, and variant selection together.
- **Behavior:** Each live specimen is an editable textarea. Input synchronizes immediately across visible specimens; an offscreen field receives the latest complete proof before it enters the viewport or accepts focus. `content-visibility` contains offscreen rendering work. Coverage becomes pending on the same input event, then settles after a short pause in the Worker; stale responses cannot replace a newer proof. A specimen preloads its stylesheet once it is within one viewport of the visible area, then applies the catalog font only inside the visibility margin so nearby CSS does not trigger offscreen WOFF2 downloads. The field preserves line breaks and scrolls internally when long content reaches 60vh (up to 720px). License and source links remain attached below it.
- **Family controls:** Packages that are delivery variants of one upstream family share one specimen. The header exposes each independent axis separately, uses the upstream order, and selects the declared upstream default. Weight uses a compact select for static instances and a range control for variable fonts. The package identifier, coverage status, facts, source links, and embed code always follow the active combination.

### Embed Rows

- **Style:** Copyable code occupies the fluid cell; a high-contrast action occupies a fixed-width cell.
- **State:** Hover changes the action to Proof Red. Keyboard focus uses Focus Blue. On small screens, the action moves below the code and reaches a 44px minimum height. Copying uses the Clipboard API followed by a legacy browser fallback. If both fail, a localized alert appears directly below the affected row; retrying clears the prior result before reporting the new state.

### Empty Results

- **State:** When search or font filters produce no families, show one high-contrast recovery action that clears only the search query and those font filters. Preserve proof text, proof presets, appearance, preview colors, CDN, fallback, and complete-coverage state.

### PWA Update Notice

- **Style:** A fixed, ruled specification slip with a vertical `REV / 002` or `LOCAL / 001` index, literal status copy, and attached actions. It uses the existing paper, ink, and Proof Red roles without shadow or rounded corners.
- **Behavior:** A downloaded update stays waiting until the visitor chooses `立即更新`. `稍後` dismisses the notice without blocking the page. Activation reloads once. An update-activation failure replaces the action with `再試一次` and an assertive status message.
- **Responsive:** The notice sits at the lower right on wide screens. At 600px and below it becomes a full-width bottom sheet with 44px minimum actions and no side or bottom border.
- **Accessibility:** The notice is a polite live status by default and an assertive alert on failure. Every action has a visible keyboard focus state, and entry motion is disabled when reduced motion is requested.
- **Language:** Status, recovery, and action copy follows the active static locale. Every locale page remains available through the shared offline app shell.

## Do's and Don'ts

### Do:

- **Do** keep the user's text, controls, coverage result, package version, and embed code in one traceable workflow.
- **Do** use one-pixel rules and paper-tone shifts to establish hierarchy.
- **Do** preserve visible focus, explicit status labels, and WCAG 2.2 AA contrast.
- **Do** model new weights and variants as data attached to the same specimen structure.
- **Do** write interface copy as short task labels or verifiable facts.

### Don't:

- **Don't** turn specimens into rounded cards, tiles, or a generic dashboard grid.
- **Don't** add shadows, gradients, fake ink, grain, crop marks, or registration decoration without an operational purpose.
- **Don't** use catalog typefaces for interface chrome.
- **Don't** detach license, source, version, or CDN information from the font it describes.
- **Don't** fabricate availability, performance, popularity, or legal claims.
