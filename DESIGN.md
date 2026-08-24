---
name: CJK Web Fonts
description: A calm, exacting type-specimen system for testing and specifying CJK web fonts.
colors:
  specification-paper: "#e7e3d8"
  raised-paper: "#f1eee6"
  registration-ink: "#171816"
  secondary-ink: "#60655f"
  hairline-rule: "#9a9c94"
  proof-red: "#c84125"
  reversed-paper: "#fff8ef"
  verified-green: "#1e6650"
  missing-red: "#a63224"
  focus-blue: "#0b69a3"
  selection-rose: "#d6a89d"
typography:
  display:
    fontFamily: '"Taipei Sans TC", "Noto Sans TC", sans-serif'
    fontSize: "clamp(2.4rem, 5vw, 5.4rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  body:
    fontFamily: '"Taipei Sans TC", "Noto Sans TC", sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: '"Taipei Sans TC", "Noto Sans TC", sans-serif'
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

**Display Font:** Taipei Sans TC (with Noto Sans TC and generic sans-serif fallbacks)
**Body Font:** Taipei Sans TC (with Noto Sans TC and generic sans-serif fallbacks)
**Label/Mono Font:** The interface sans for labels; the system monospace stack for package names, code, and character counts.

**Character:** One neutral CJK sans gives the interface institutional clarity. Scale, spacing, case, and numeric alignment create hierarchy; font switching is reserved for the user-selected specimens.

### Hierarchy

- **Display** (400, fluid from 2.4rem to 5.4rem, 0.98 line height): The primary task statement. Keep it concise and allow a tight editorial silhouette.
- **Body** (400, 1rem, 1.5 line height): Instructions and explanatory copy, normally kept near 55 characters per line.
- **Title** (500, 1.35rem): Font names and specimen-level headings.
- **Label** (400, 0.72rem, compact): Controls, facts, statuses, and technical annotations. Numeric labels use tabular figures where comparison matters.
- **Code** (400, 0.72rem, system monospace): Package identifiers and copyable embed markup.

**The Specimen Owns the Typeface Rule.** Interface typography stays neutral. Catalog fonts appear in live specimen regions, never in navigation or controls.

**The Data Stays Compact Rule.** Technical metadata may be small, but must retain readable contrast, explicit units, and complete package identifiers.

## Layout

The base composition is a two-column workbench. A narrow specification rail holds search and proof controls; the fluid field holds the editable master proof and catalog. One-pixel rules join regions into a continuous sheet instead of separating them into floating cards.

Page edges and specimen interiors use a fluid section inset (`3vw`). Major proof regions scale with `clamp()` while control dimensions remain stable. Dense metadata wraps instead of truncating.

At 900px and below, reading order becomes proof, controls, then catalog. The control rail stops being sticky and becomes a two-column calibration panel. At 600px and below, controls become a single column, headers stack, embed actions occupy their own full-width row, and specimen type is capped at 12vw to prevent horizontal overflow.

**The Task Before the Catalog Rule.** On every viewport, visitors encounter editable proof text and essential controls before the result list.

## Elevation & Depth

The system is flat. It uses no shadows. Depth comes from paper-tone changes, one-pixel rules, and sticky positioning where a persistent control surface is operationally useful.

**The Printed Plane Rule.** Do not use drop shadows, glass effects, bevels, or simulated paper texture. A region earns separation through structure and tone.

## Shapes

Rectangles are square and rules are thin. Text fields, selects, proof areas, status labels, embed rows, and specimen containers use zero radius. The only circular control is the compact foreground/background swap action, whose silhouette communicates reversal rather than a new container style.

**The Square Instrument Rule.** Keep operational fields and containers square. Circular geometry is reserved for the swap control or a semantically circular mark.

## Components

### Navigation

- **Style:** A ruled header with the approved CJK brand mark, compact wordmark, edition label, and literal text links. Render the raster mark at 40px inside a 44px Specification Paper field so its registration-ink details remain visible in every color mode. Resize or convert the approved asset only; do not redraw, recolor, or add effects.
- **State:** Links use the global underline and keyboard-focus treatment. On narrow screens, the task link remains visible while the external repository link may be hidden.

### Inputs / Fields

- **Style:** Paper background, one-pixel Hairline Rule border, square corners, and a stable minimum height of 42px.
- **Focus:** A two-pixel Focus Blue outline with clear offset. Segmented radio options place the outline inside the group so it is never clipped.
- **Text Area:** The master proof is larger, resizable, and uses Registration Ink for its border. Preview foreground and background colors may override its content field only.

### Segmented Controls

- **Style:** Three equal cells share one outer rule. Dividers are continuous and labels remain compact.
- **State:** The selected cell reverses to Registration Ink over Specification Paper. State cannot rely on accent color alone.

### Status Labels

- **Style:** Plain text inside a one-pixel border in the matching semantic color.
- **State:** Checking, complete, and missing states use literal Traditional Chinese labels. Missing-glyph details remain adjacent to the affected specimen.

### Font Specimens

- **Style:** Each font is a full-width ruled section, not a card. Its header keeps name, exact package version, coverage state, and variant selection together.
- **Behavior:** The live specimen preserves line breaks, wraps long strings anywhere, and responds to the shared size and color controls. License and source links remain attached below it.

### Embed Rows

- **Style:** Copyable code occupies the fluid cell; a high-contrast action occupies a fixed-width cell.
- **State:** Hover changes the action to Proof Red. Keyboard focus uses Focus Blue. On small screens, the action moves below the code and reaches a 44px minimum height.

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
