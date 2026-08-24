#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / ".work" / "glow-sans-tc" / "source"
WEIGHTS = {
    "Thin": 100,
    "ExtraLight": 200,
    "Light": 300,
    "Regular": 400,
    "Book": 500,
    "Medium": 600,
    "Bold": 700,
    "ExtraBold": 800,
    "Heavy": 900,
}


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
    if len(sys.argv) != 4:
        raise SystemExit(
            "usage: audit_glow_sans_tc.py <package-id> <width> <css-stretch>"
        )
    package_id, width, stretch = sys.argv[1:]
    dist_root = ROOT / "packages" / package_id / "dist"
    expected_variants = 8 if width == "Compressed" else 9
    failed = False
    variant_count = 0
    woff2_paths: list[Path] = []
    for style, expected_weight in WEIGHTS.items():
        source_path = SOURCE_ROOT / width / f"GlowSansTC-{width}-{style}.otf"
        if not source_path.is_file():
            if width == "Compressed" and style == "Heavy":
                continue
            print(f"missing source variant: {source_path.relative_to(ROOT)}")
            failed = True
            continue

        variant_count += 1
        source_codepoints = inspect_font(source_path)
        output_dir = dist_root / style
        css_path = output_dir / "Glow-Sans-TC.css"
        style_paths = sorted(output_dir.glob("*.woff2"))
        output_codepoints: set[int] = set()
        for path in style_paths:
            output_codepoints.update(inspect_font(path))
        missing_output = source_codepoints - output_codepoints
        missing_css = source_codepoints - css_codepoints(css_path)
        css = css_path.read_text(encoding="utf-8")
        descriptors_ok = (
            f"font-weight: {expected_weight};" in css
            and f"font-stretch: {stretch};" in css
        )
        print(
            f"{width} {style}: {len(source_codepoints)} codepoints, "
            f"{len(style_paths)} WOFF2 files, "
            f"missing output={len(missing_output)}, missing CSS={len(missing_css)}"
        )
        failed |= not style_paths or bool(missing_output or missing_css)
        failed |= not descriptors_ok
        woff2_paths.extend(style_paths)

    total_bytes = sum(path.stat().st_size for path in woff2_paths)
    largest_bytes = max(path.stat().st_size for path in woff2_paths)
    print(f"variants: {variant_count}")
    print(f"total WOFF2 files: {len(woff2_paths)}")
    print(f"WOFF2 bytes: {total_bytes}")
    print(f"largest WOFF2 bytes: {largest_bytes}")
    failed |= variant_count != expected_variants
    if failed:
        raise SystemExit("Wêlai Glow Sans TC audit failed")


if __name__ == "__main__":
    main()
