#!/usr/bin/env python3

from __future__ import annotations

import re
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / ".work" / "lxgw-wenkai-tc" / "source"
DIST_ROOT = ROOT / "packages" / "lxgw-wenkai-tc" / "dist"
VARIANTS = {
    ("Proportional", "Light"): "LXGWWenKaiTC-Light.ttf",
    ("Proportional", "Regular"): "LXGWWenKaiTC-Regular.ttf",
    ("Proportional", "Medium"): "LXGWWenKaiTC-Medium.ttf",
    ("Monospaced", "Light"): "LXGWWenKaiMonoTC-Light.ttf",
    ("Monospaced", "Regular"): "LXGWWenKaiMonoTC-Regular.ttf",
    ("Monospaced", "Medium"): "LXGWWenKaiMonoTC-Medium.ttf",
}


def inspect_font(path: Path) -> set[int]:
    with TTFont(path, lazy=False) as font:
        return {
            point
            for table in font["cmap"].tables
            if table.isUnicode() and table.format != 14
            for point in table.cmap
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
    failed = False
    all_paths: list[Path] = []
    for (family, style), source_name in VARIANTS.items():
        source_points = inspect_font(SOURCE_ROOT / source_name)
        output_dir = DIST_ROOT / family / style
        output_paths = sorted(output_dir.glob("*.woff2"))
        output_points = set().union(*(inspect_font(path) for path in output_paths))
        css_name = "LXGW-WenKai-TC.css" if family == "Proportional" else "LXGW-WenKai-Mono-TC.css"
        css_points = css_codepoints(output_dir / css_name)
        print(f"{family} {style}: {len(source_points)} codepoints, {len(output_paths)} files")
        failed |= not output_paths or source_points != output_points or source_points != css_points
        all_paths.extend(output_paths)
    total_bytes = sum(path.stat().st_size for path in all_paths)
    largest_bytes = max(path.stat().st_size for path in all_paths)
    print(f"WOFF2 bytes: {total_bytes}")
    print(f"largest WOFF2 bytes: {largest_bytes}")
    failed |= largest_bytes > 20_000_000 or total_bytes > 140_000_000
    if failed:
        raise SystemExit("LXGW WenKai TC audit failed")


if __name__ == "__main__":
    main()
