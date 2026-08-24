#!/usr/bin/env python3

from __future__ import annotations

import re
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / ".work" / "taipei-sans-tc" / "source"
DIST_ROOT = ROOT / "packages" / "taipei-sans-tc" / "dist"
STYLES = ("Light", "Regular", "Bold")
EXPECTED_CODEPOINTS = {"Light": 32_762, "Regular": 32_731, "Bold": 32_732}
EXPECTED_WOFF2_FILES = 83
MAX_FILE_BYTES = 20_000_000
MAX_PACKAGE_BYTES = 100_000_000


def inspect_font(path: Path) -> set[int]:
    with TTFont(path, lazy=False) as font:
        result: set[int] = set()
        for table in font["cmap"].tables:
            if table.isUnicode() and table.format != 14:
                result.update(table.cmap)
        return result


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
    for style in STYLES:
        source_codepoints = inspect_font(SOURCE_ROOT / f"TaipeiSansTCBeta-{style}.ttf")
        style_dir = DIST_ROOT / style
        style_paths = sorted(style_dir.glob("*.woff2"))
        output_codepoints: set[int] = set()
        for path in style_paths:
            output_codepoints.update(inspect_font(path))
        missing_output = source_codepoints - output_codepoints
        missing_css = source_codepoints - css_codepoints(style_dir / "Taipei-Sans-TC.css")
        print(f"{style} source codepoints: {len(source_codepoints)}")
        print(f"{style} output codepoints: {len(output_codepoints)}")
        print(f"{style} WOFF2 files: {len(style_paths)}")
        print(f"{style} missing output codepoints: {len(missing_output)}")
        print(f"{style} missing CSS codepoints: {len(missing_css)}")
        failed |= len(source_codepoints) != EXPECTED_CODEPOINTS[style]
        failed |= len(output_codepoints) != EXPECTED_CODEPOINTS[style]
        failed |= len(style_paths) != EXPECTED_WOFF2_FILES
        failed |= bool(missing_output or missing_css)
        woff2_paths.extend(style_paths)

    total_bytes = sum(path.stat().st_size for path in woff2_paths)
    largest_bytes = max(path.stat().st_size for path in woff2_paths)
    print(f"total WOFF2 files: {len(woff2_paths)}")
    print(f"WOFF2 bytes: {total_bytes}")
    print(f"largest WOFF2 bytes: {largest_bytes}")
    failed |= largest_bytes > MAX_FILE_BYTES or total_bytes > MAX_PACKAGE_BYTES
    if failed:
        raise SystemExit("Taipei Sans TC audit failed")


if __name__ == "__main__":
    main()
