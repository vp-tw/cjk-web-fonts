#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from pathlib import Path

from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / ".work" / "jigmo" / "source"
DIST_ROOT = ROOT / "packages" / "jigmo" / "dist"
FAMILIES = ("Jigmo", "Jigmo2", "Jigmo3")
EXPECTED_CODEPOINT_SUM = 127_421
EXPECTED_CODEPOINT_UNION = 125_786
EXPECTED_VARIATION_SEQUENCES = 29_635
EXPECTED_WOFF2_FILES = 169
MAX_FILE_BYTES = 20_000_000
MAX_PACKAGE_BYTES = 100_000_000


def inspect_font(path: Path) -> tuple[set[int], set[tuple[int, int, bool]]]:
    with TTFont(path, lazy=False) as font:
        codepoints: set[int] = set()
        sequences: set[tuple[int, int, bool]] = set()
        for table in font["cmap"].tables:
            if table.format == 14:
                for selector, entries in table.uvsDict.items():
                    sequences.update(
                        (base, selector, glyph_name is None)
                        for base, glyph_name in entries
                    )
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
    source_codepoints: set[int] = set()
    source_sequences: set[tuple[int, int, bool]] = set()
    output_codepoints: set[int] = set()
    output_sequences: set[tuple[int, int, bool]] = set()
    woff2_paths: list[Path] = []
    source_codepoint_sum = 0

    for family in FAMILIES:
        family_source_codepoints, family_source_sequences = inspect_font(
            SOURCE_ROOT / f"{family}.ttf"
        )
        source_codepoints.update(family_source_codepoints)
        source_codepoint_sum += len(family_source_codepoints)
        source_sequences.update(family_source_sequences)

        family_dir = DIST_ROOT / family
        family_paths = sorted(family_dir.glob("*.woff2"))
        woff2_paths.extend(family_paths)
        for path in family_paths:
            codepoints, sequences = inspect_font(path)
            output_codepoints.update(codepoints)
            output_sequences.update(sequences)

        css_points = css_codepoints(family_dir / "Jigmo.css")
        missing_css = family_source_codepoints - css_points
        if missing_css:
            raise SystemExit(f"{family}: CSS misses {len(missing_css)} codepoints")

    checks = {
        "source codepoint sum": (source_codepoint_sum, EXPECTED_CODEPOINT_SUM),
        "source codepoint union": (len(source_codepoints), EXPECTED_CODEPOINT_UNION),
        "output codepoint union": (len(output_codepoints), EXPECTED_CODEPOINT_UNION),
        "source variation sequences": (
            len(source_sequences),
            EXPECTED_VARIATION_SEQUENCES,
        ),
        "output variation sequences": (
            len(output_sequences),
            EXPECTED_VARIATION_SEQUENCES,
        ),
        "WOFF2 files": (len(woff2_paths), EXPECTED_WOFF2_FILES),
    }
    failed = False
    for name, (actual, expected) in checks.items():
        print(f"{name}: {actual}")
        failed |= actual != expected

    missing_codepoints = source_codepoints - output_codepoints
    missing_sequences = source_sequences - output_sequences
    total_bytes = sum(path.stat().st_size for path in woff2_paths)
    largest_bytes = max(path.stat().st_size for path in woff2_paths)
    print(f"missing codepoints: {len(missing_codepoints)}")
    print(f"missing variation sequences: {len(missing_sequences)}")
    print(f"WOFF2 bytes: {total_bytes}")
    print(f"largest WOFF2 bytes: {largest_bytes}")

    failed |= bool(missing_codepoints or missing_sequences)
    failed |= largest_bytes > MAX_FILE_BYTES or total_bytes > MAX_PACKAGE_BYTES
    if failed:
        raise SystemExit("Jigmo audit failed")


if __name__ == "__main__":
    main()
