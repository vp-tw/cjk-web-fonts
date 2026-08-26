#!/usr/bin/env python3

from __future__ import annotations

import sys
from pathlib import Path

from fontTools.ttLib import TTFont


MAX_BUCKET_SIZE = 16_384
EXPECTED_CODEPOINTS = 1_114_112


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: prepare_last_resort.py INPUT.ttf RANGES.css")

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

    ranges = [
        (start, min(start + MAX_BUCKET_SIZE - 1, codepoints[-1]))
        for start in range(codepoints[0], codepoints[-1] + 1, MAX_BUCKET_SIZE)
    ]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        "\n".join(
            f'/* Range {index:03d} */\n@font-face {{\n  font-family: "Last Resort";\n  unicode-range: U+{start:X}-{end:X};\n}}'
            for index, (start, end) in enumerate(ranges, start=1)
        )
        + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
