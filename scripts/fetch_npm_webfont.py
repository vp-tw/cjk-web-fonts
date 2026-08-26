#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import json
import shutil
import sys
import tarfile
import urllib.request
from pathlib import Path, PurePosixPath


def download(url: str, target: Path) -> None:
    if target.exists():
        return
    request = urllib.request.Request(url, headers={"User-Agent": "VdustR/cjk-web-fonts source fetcher"})
    with urllib.request.urlopen(request) as response, target.open("wb") as output:
        shutil.copyfileobj(response, output)


def verify(path: Path, expected_bytes: int, expected_sha256: str) -> None:
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if path.stat().st_size != expected_bytes or digest != expected_sha256:
        path.unlink(missing_ok=True)
        raise SystemExit(f"source verification failed for {path.name}")


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: fetch_npm_webfont.py <source.json> <work-dir> <dist-dir>")
    manifest_path, work_dir, dist_dir = map(Path, sys.argv[1:])
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    work_dir.mkdir(parents=True, exist_ok=True)
    archive = work_dir / manifest["archive"]
    download(manifest["url"], archive)
    verify(archive, manifest["bytes"], manifest["sha256"])

    if dist_dir.exists():
        shutil.rmtree(dist_dir)
    dist_dir.mkdir(parents=True)
    file_count = 0
    with tarfile.open(archive, "r:gz") as source:
        members = [member for member in source.getmembers() if member.isfile()]
        if len(members) != manifest["fileCount"]:
            raise SystemExit(f"archive file count differs: {len(members)}")
        for member in members:
            path = PurePosixPath(member.name)
            if len(path.parts) < 3 or path.parts[:2] not in (("package", "css"), ("package", "woff2")):
                continue
            relative = Path(*path.parts[1:])
            target = dist_dir / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            extracted = source.extractfile(member)
            if extracted is None:
                raise SystemExit(f"cannot extract {member.name}")
            with target.open("wb") as output:
                shutil.copyfileobj(extracted, output)
            file_count += 1

    license_item = manifest["licenseFile"]
    license_path = work_dir / "LICENSE.font.txt"
    download(license_item["url"], license_path)
    verify(license_path, license_item["bytes"], license_item["sha256"])
    shutil.copyfile(license_path, dist_dir.parent / "LICENSE.font.txt")
    print(f"verified {manifest['name']} {manifest['version']}: {file_count} web files")


if __name__ == "__main__":
    main()
