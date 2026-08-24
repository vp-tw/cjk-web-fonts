#!/usr/bin/env python3

from __future__ import annotations

import re
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / ".work" / "fusion-pixel-font" / "source"
DIST_ROOT = ROOT / "packages" / "fusion-pixel-font" / "dist"
SIZES = ("8px", "10px", "12px")
SPACING_MODES = ("monospaced", "proportional")
LANGUAGES = {
    "latin": "Latin",
    "zh_hans": "Simplified Chinese",
    "zh_hant": "Traditional Chinese",
    "ja": "Japanese",
    "ko": "Korean",
}
EXPECTED_CODEPOINTS = {
    ("8px", "monospaced"): 27_976,
    ("8px", "proportional"): 27_976,
    ("10px", "monospaced"): 24_801,
    ("10px", "proportional"): 25_070,
    ("12px", "monospaced"): 36_502,
    ("12px", "proportional"): 36_521,
}
EXPECTED_WOFF2_FILES = {
    ("8px", "monospaced"): 55,
    ("8px", "proportional"): 55,
    ("10px", "monospaced"): 62,
    ("10px", "proportional"): 64,
    ("12px", "monospaced"): 78,
    ("12px", "proportional"): 78,
}
MAX_FILE_BYTES = 20_000_000
MAX_PACKAGE_BYTES = 100_000_000


def inspect_font(path: Path) -> tuple[set[int], set[tuple[int, int, bool]]]:
    with TTFont(path, lazy=False) as font:
        codepoints: set[int] = set()
        sequences: set[tuple[int, int, bool]] = set()
        for table in font["cmap"].tables:
            if table.format == 14:
                for selector, entries in table.uvsDict.items():
                    sequences.update((base, selector, glyph is None) for base, glyph in entries)
            elif table.isUnicode():
                codepoints.update(table.cmap)
        return codepoints, sequences


def css_codepoints(path: Path) -> set[int]:
    text = path.read_text(encoding="utf-8")
    result: set[int] = set()
    for descriptor in re.findall(r"unicode-range:\s*([^;]+)", text, re.I):
        for item in descriptor.split(","):
            token = item.strip().upper().removeprefix("U+")
            if "?" in token:
                start = int(token.replace("?", "0"), 16)
                end = int(token.replace("?", "F"), 16)
            elif "-" in token:
                left, right = token.split("-", 1)
                start, end = int(left, 16), int(right, 16)
            else:
                start = end = int(token, 16)
            result.update(range(start, end + 1))
    return result


def main() -> None:
    woff2_paths: list[Path] = []
    failed = False
    for size in SIZES:
        for spacing in SPACING_MODES:
            spacing_name = spacing.title()
            for language, language_name in LANGUAGES.items():
                variant = f"{size}/{spacing}/{language}"
                source_path = (
                    SOURCE_ROOT
                    / size
                    / spacing
                    / f"fusion-pixel-{size}-{spacing}-{language}.otf.woff2"
                )
                family = f"Fusion Pixel {size} {spacing_name} {language_name}"
                css_name = family.replace(" ", "-") + ".css"
                variant_dir = DIST_ROOT / size / spacing / language
                variant_paths = sorted(variant_dir.glob("*.woff2"))
                source_codepoints, source_sequences = inspect_font(source_path)
                output_codepoints: set[int] = set()
                output_sequences: set[tuple[int, int, bool]] = set()
                for path in variant_paths:
                    codepoints, sequences = inspect_font(path)
                    output_codepoints.update(codepoints)
                    output_sequences.update(sequences)
                missing_output = source_codepoints - output_codepoints
                missing_sequences = source_sequences - output_sequences
                missing_css = source_codepoints - css_codepoints(variant_dir / css_name)
                css_text = (variant_dir / css_name).read_text(encoding="utf-8")
                css_families = set(re.findall(r'font-family:\s*"([^"]+)"', css_text))
                print(
                    f"{variant}: codepoints={len(source_codepoints)}, "
                    f"sequences={len(source_sequences)}, files={len(variant_paths)}, "
                    f"missing_output={len(missing_output)}, "
                    f"missing_sequences={len(missing_sequences)}, "
                    f"missing_css={len(missing_css)}"
                )
                failed |= bool(missing_output or missing_sequences or missing_css)
                failed |= len(source_codepoints) != EXPECTED_CODEPOINTS[(size, spacing)]
                failed |= len(output_codepoints) != EXPECTED_CODEPOINTS[(size, spacing)]
                failed |= len(variant_paths) != EXPECTED_WOFF2_FILES[(size, spacing)]
                failed |= css_families != {family}
                woff2_paths.extend(variant_paths)

    total_bytes = sum(path.stat().st_size for path in woff2_paths)
    largest_bytes = max(path.stat().st_size for path in woff2_paths)
    print(f"total WOFF2 files: {len(woff2_paths)}")
    print(f"WOFF2 bytes: {total_bytes}")
    print(f"largest WOFF2 bytes: {largest_bytes}")
    failed |= largest_bytes > MAX_FILE_BYTES or total_bytes > MAX_PACKAGE_BYTES
    if failed:
        raise SystemExit("Fusion Pixel Font audit failed")


if __name__ == "__main__":
    main()
