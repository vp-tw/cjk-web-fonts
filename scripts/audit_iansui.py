#!/usr/bin/env python3

from __future__ import annotations

import re
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]


def inspect_font(path: Path) -> set[int]:
    with TTFont(path, lazy=False) as font:
        return {point for table in font["cmap"].tables if table.isUnicode() and table.format != 14 for point in table.cmap}


def css_codepoints(path: Path) -> set[int]:
    result: set[int] = set()
    for descriptor in re.findall(r"unicode-range:\s*([^;]+)", path.read_text(encoding="utf-8"), re.I):
        for item in descriptor.split(","):
            token = item.strip().upper().removeprefix("U+")
            if "-" in token:
                left, right = token.split("-", 1)
                result.update(range(int(left, 16), int(right, 16) + 1))
            else:
                result.add(int(token, 16))
    return result


def main() -> None:
    source_points = inspect_font(ROOT / ".work/iansui/source/Iansui-Regular.ttf")
    output_dir = ROOT / "packages/iansui/dist/Regular"
    output_paths = sorted(output_dir.glob("*.woff2"))
    output_points = set().union(*(inspect_font(path) for path in output_paths))
    css_points = css_codepoints(output_dir / "Iansui.css")
    total_bytes = sum(path.stat().st_size for path in output_paths)
    largest_bytes = max(path.stat().st_size for path in output_paths)
    print(f"source codepoints: {len(source_points)}")
    print(f"output codepoints: {len(output_points)}")
    print(f"WOFF2 files: {len(output_paths)}")
    print(f"WOFF2 bytes: {total_bytes}")
    print(f"largest WOFF2 bytes: {largest_bytes}")
    if not output_paths or source_points != output_points or source_points != css_points or largest_bytes > 20_000_000 or total_bytes > 140_000_000:
        raise SystemExit("Iansui audit failed")


if __name__ == "__main__":
    main()
