#!/usr/bin/env python3

from __future__ import annotations

import copy
import sys
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.ttLib import TTFont


GLYPH_POOL_SIZE = 2048
MAX_CODEPOINT = 0x10FFFF
EXCLUDED_CODEPOINTS = {0, 0xFE0F}


def write_range_css(path: Path) -> None:
    ranges: list[tuple[int, int]] = []
    start = 1
    while start <= MAX_CODEPOINT:
        end = min(start + 16383, MAX_CODEPOINT)
        if start <= 0xFE0F <= end:
            if start < 0xFE0F:
                ranges.append((start, 0xFE0E))
            start = 0xFE10
            continue
        ranges.append((start, end))
        start = end + 1

    path.write_text(
        "\n".join(
            f'/* Range {index:03d} */\n@font-face {{\n  font-family: "Tofu";\n  unicode-range: U+{start:X}-{end:X};\n}}'
            for index, (start, end) in enumerate(ranges, start=1)
        )
        + "\n",
        encoding="utf-8",
    )


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: prepare_tofu.py INPUT.ttf OUTPUT.ttf RANGES.css")

    source_path, output_path, range_css_path = map(Path, sys.argv[1:])
    with TTFont(source_path) as font:
        source_glyph = font["glyf"]["tofu"]
        source_metrics = font["hmtx"]["tofu"]
        glyph_names = [f"tofu.{index:04d}" for index in range(GLYPH_POOL_SIZE)]
        glyphs = {".notdef": font["glyf"][".notdef"]}
        metrics = {".notdef": font["hmtx"][".notdef"]}
        for glyph_name in glyph_names:
            glyphs[glyph_name] = copy.deepcopy(source_glyph)
            metrics[glyph_name] = source_metrics

        builder = FontBuilder(font=font)
        builder.setupGlyphOrder([".notdef", *glyph_names])
        builder.setupGlyf(glyphs)
        builder.setupHorizontalMetrics(metrics)
        builder.setupCharacterMap(
            {
                codepoint: glyph_names[(codepoint - 1) % GLYPH_POOL_SIZE]
                for codepoint in range(1, MAX_CODEPOINT + 1)
                if codepoint not in EXCLUDED_CODEPOINTS
            }
        )
        builder.setupPost(keepGlyphNames=False)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        font.save(output_path, reorderTables=False)
    write_range_css(range_css_path)


if __name__ == "__main__":
    main()
