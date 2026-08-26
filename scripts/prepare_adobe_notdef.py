#!/usr/bin/env python3

from __future__ import annotations

import sys
from pathlib import Path

from fontTools.ttLib import TTFont


MAX_BUCKET_SIZE = 16_384
EXPECTED_CODEPOINTS = 1_111_998


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: prepare_adobe_notdef.py INPUT.otf RANGES.css")

    source_path, output_path = map(Path, sys.argv[1:])
    with TTFont(source_path) as font:
        codepoints = sorted(
            {
                codepoint
                for table in font["cmap"].tables
                if table.isUnicode()
                for codepoint in table.cmap
            }
        )
    if len(codepoints) != EXPECTED_CODEPOINTS:
        raise SystemExit(f"unexpected upstream coverage: {len(codepoints)} codepoints")

    ranges: list[tuple[int, int]] = []
    start = previous = codepoints[0]
    for codepoint in codepoints[1:]:
        if codepoint != previous + 1 or codepoint - start >= MAX_BUCKET_SIZE:
            ranges.append((start, previous))
            start = codepoint
        previous = codepoint
    ranges.append((start, previous))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        "\n".join(
            f'/* Range {index:03d} */\n@font-face {{\n  font-family: "Adobe NotDef";\n  unicode-range: U+{start:X}-{end:X};\n}}'
            for index, (start, end) in enumerate(ranges, start=1)
        )
        + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
