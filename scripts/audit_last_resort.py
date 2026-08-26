#!/usr/bin/env python3

from __future__ import annotations

import re
from pathlib import Path

from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".work/last-resort/source/LastResort-Regular.ttf"
DIST = ROOT / "packages/last-resort/dist"
EXPECTED_CODEPOINTS = 1_114_112


def codepoints(path: Path) -> set[int]:
    with TTFont(path) as font:
        return {
            codepoint
            for table in font["cmap"].tables
            if table.isUnicode()
            for codepoint in table.cmap
        }


def css_codepoints(path: Path) -> set[int]:
    result: set[int] = set()
    for descriptor in re.findall(r"unicode-range:\s*([^;]+)", path.read_text(encoding="utf-8"), re.I):
        for item in descriptor.split(","):
            token = item.strip().upper().removeprefix("U+")
            left, separator, right = token.partition("-")
            result.update(range(int(left, 16), int(right if separator else left, 16) + 1))
    return result


def main() -> None:
    source_points = codepoints(SOURCE)
    output_paths = sorted(DIST.glob("*.woff2"))
    if not output_paths:
        raise SystemExit("no Last Resort WOFF2 files found")
    output_points = set().union(*(codepoints(path) for path in output_paths))
    css_points = css_codepoints(DIST / "Last-Resort.css")

    for label, points in {"source": source_points, "output": output_points, "CSS": css_points}.items():
        print(f"{label} codepoints: {len(points)}")
        if len(points) != EXPECTED_CODEPOINTS:
            raise SystemExit(f"{label} coverage differs from upstream")
    if not source_points == output_points == css_points:
        raise SystemExit("Last Resort codepoint sets differ")
    print(f"WOFF2 files: {len(output_paths)}")
    print(f"WOFF2 bytes: {sum(path.stat().st_size for path in output_paths)}")


if __name__ == "__main__":
    main()
