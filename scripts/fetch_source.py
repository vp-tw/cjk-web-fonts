#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import json
import shutil
import sys
import urllib.request
import zipfile
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: fetch_source.py <manifest.json> <output-dir>")

    manifest_path = Path(sys.argv[1]).resolve()
    output_dir = Path(sys.argv[2]).resolve()
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    output_dir.mkdir(parents=True, exist_ok=True)
    archive_path = output_dir / manifest["archive"]

    if not archive_path.exists():
        request = urllib.request.Request(
            manifest["url"],
            headers={"User-Agent": "VdustR/cjk-web-fonts source fetcher"},
        )
        with urllib.request.urlopen(request) as response, archive_path.open("wb") as target:
            shutil.copyfileobj(response, target)

    digest = hashlib.sha256(archive_path.read_bytes()).hexdigest()
    if digest != manifest["sha256"]:
        archive_path.unlink(missing_ok=True)
        raise SystemExit(
            f"SHA-256 mismatch for {manifest['archive']}: "
            f"expected {manifest['sha256']}, got {digest}"
        )

    if archive_path.stat().st_size != manifest["bytes"]:
        raise SystemExit(
            f"size mismatch for {manifest['archive']}: "
            f"expected {manifest['bytes']}, got {archive_path.stat().st_size}"
        )

    extract_dir = output_dir / "source"
    extract_dir.mkdir(exist_ok=True)
    with zipfile.ZipFile(archive_path) as archive:
        names = set(archive.namelist())
        expected = set(manifest["files"])
        if names != expected:
            raise SystemExit(
                f"archive members differ: missing={sorted(expected - names)}, "
                f"extra={sorted(names - expected)}"
            )
        archive.extractall(extract_dir)

    print(f"verified {manifest['name']} {manifest['version']} ({digest})")


if __name__ == "__main__":
    main()
