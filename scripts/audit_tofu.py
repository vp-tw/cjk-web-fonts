#!/usr/bin/env python3

from __future__ import annotations

import re
from pathlib import Path

from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".work/tofu/source/tofu.ttf"
PREPARED = ROOT / ".work/tofu/Tofu-Format12.ttf"
DIST = ROOT / "packages/tofu/dist"
EXPECTED_CODEPOINTS = 1_114_110


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
    for descriptor in re.findall(
        r"unicode-range:\s*([^;]+)", path.read_text(encoding="utf-8"), re.I
    ):
        for item in descriptor.split(","):
            token = item.strip().upper().removeprefix("U+")
            if "-" in token:
                left, right = token.split("-", 1)
                result.update(range(int(left, 16), int(right, 16) + 1))
            else:
                result.add(int(token, 16))
    return result


def main() -> None:
    source_points = codepoints(SOURCE)
    prepared_points = codepoints(PREPARED)
    output_paths = sorted(DIST.glob("*.woff2"))
    output_points = set().union(*(codepoints(path) for path in output_paths))
    css_points = css_codepoints(DIST / "Tofu.css")

    checks = {
        "source codepoints": len(source_points),
        "prepared codepoints": len(prepared_points),
        "output codepoints": len(output_points),
        "CSS codepoints": len(css_points),
    }
    for label, value in checks.items():
        print(f"{label}: {value}")
        if value != EXPECTED_CODEPOINTS:
            raise SystemExit(f"{label} differs from upstream")
    if not source_points == prepared_points == output_points == css_points:
        raise SystemExit("Tofu codepoint sets differ")
    if any(
        table.format == 13
        for path in output_paths
        for table in TTFont(path)["cmap"].tables
    ):
        raise SystemExit("published Tofu subsets must not use cmap format 13")
    print(f"WOFF2 files: {len(output_paths)}")
    print(f"WOFF2 bytes: {sum(path.stat().st_size for path in output_paths)}")


if __name__ == "__main__":
    main()
