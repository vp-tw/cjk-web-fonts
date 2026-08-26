#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]


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
    if len(sys.argv) < 3:
        raise SystemExit("usage: audit_chiron_webfont.py <package-id> <css> [<css> ...]")
    package_id, *css_names = sys.argv[1:]
    dist = ROOT / "packages" / package_id / "dist"
    failed = False
    referenced: set[Path] = set()
    for css_name in css_names:
        css_path = dist / "css" / css_name
        text = css_path.read_text(encoding="utf-8")
        urls = re.findall(r"url\(['\"]?([^)'\"]+)", text)
        css_files = {(css_path.parent / url).resolve() for url in urls}
        missing = {path for path in css_files if not path.is_file()}
        print(f"{css_name}: {len(css_codepoints(css_path))} codepoints, {len(css_files)} files")
        failed |= not urls or bool(missing)
        referenced.update(css_files)
    woff2_paths = sorted(dist.glob("woff2/**/*.woff2"))
    total_bytes = sum(path.stat().st_size for path in woff2_paths)
    largest_bytes = max(path.stat().st_size for path in woff2_paths)
    print(f"WOFF2 files: {len(woff2_paths)}")
    print(f"referenced WOFF2 files: {len(referenced)}")
    print(f"WOFF2 bytes: {total_bytes}")
    print(f"largest WOFF2 bytes: {largest_bytes}")
    for path in woff2_paths:
        with TTFont(path, lazy=False) as font:
            failed |= "cmap" not in font
    failed |= set(woff2_paths) != referenced
    failed |= largest_bytes > 20_000_000 or total_bytes > 140_000_000
    if failed:
        raise SystemExit(f"{package_id} audit failed")


if __name__ == "__main__":
    main()
