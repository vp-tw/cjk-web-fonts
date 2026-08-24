#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
POLICY_PATH = ROOT / "package-size-policy.json"
REGISTRY_PATH = ROOT / "fonts.json"


@dataclass(frozen=True)
class PackResult:
    name: str
    tarball_bytes: int
    unpacked_bytes: int
    largest_file_path: str
    largest_file_bytes: int
    entry_count: int


def load_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path.name} must contain an object")
    return value


def pack_package(package_dir: Path) -> PackResult:
    completed = subprocess.run(
        ["npm", "pack", "--dry-run", "--json"],
        cwd=package_dir,
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(completed.stdout)
    if not isinstance(payload, list) or len(payload) != 1:
        raise ValueError(f"unexpected npm pack output for {package_dir.name}")
    packed = payload[0]
    files = packed.get("files", [])
    if not files:
        raise ValueError(f"npm pack included no files for {package_dir.name}")
    largest = max(files, key=lambda item: item["size"])
    return PackResult(
        name=packed["name"],
        tarball_bytes=packed["size"],
        unpacked_bytes=packed["unpackedSize"],
        largest_file_path=largest["path"],
        largest_file_bytes=largest["size"],
        entry_count=packed["entryCount"],
    )


def evaluate(result: PackResult, budgets: dict[str, int]) -> list[str]:
    checks = (
        ("tarball", result.tarball_bytes, budgets["maxTarballBytes"]),
        ("unpacked package", result.unpacked_bytes, budgets["maxUnpackedBytes"]),
        (
            f"file {result.largest_file_path}",
            result.largest_file_bytes,
            budgets["maxFileBytes"],
        ),
    )
    return [
        f"{label} is {actual:,} bytes; budget is {limit:,} bytes"
        for label, actual, limit in checks
        if actual > limit
    ]


def validate_policy(policy: dict[str, Any]) -> dict[str, int]:
    if policy.get("schemaVersion") != 1:
        raise ValueError("package-size-policy.json schemaVersion must be 1")
    budgets = policy.get("budgets")
    required = {"maxTarballBytes", "maxUnpackedBytes", "maxFileBytes"}
    if not isinstance(budgets, dict) or set(budgets) != required:
        raise ValueError(f"package size budgets must be exactly {sorted(required)}")
    if any(not isinstance(value, int) or value <= 0 for value in budgets.values()):
        raise ValueError("package size budgets must be positive integers")

    providers = policy.get("providers")
    if not isinstance(providers, list) or not providers:
        raise ValueError("package size policy must list CDN providers")
    known_package_limits: list[int] = []
    seen_ids: set[str] = set()
    for provider in providers:
        if not isinstance(provider, dict):
            raise ValueError("each CDN provider must be an object")
        missing = {
            "id",
            "label",
            "maxPackageBytes",
            "maxFileBytes",
            "source",
            "checkedOn",
            "notes",
        } - set(provider)
        if missing:
            raise ValueError(f"CDN provider misses {sorted(missing)}")
        provider_id = provider["id"]
        if not isinstance(provider_id, str) or not provider_id or provider_id in seen_ids:
            raise ValueError(f"invalid or duplicate CDN provider id: {provider_id!r}")
        seen_ids.add(provider_id)
        for field in ("maxPackageBytes", "maxFileBytes"):
            limit = provider.get(field)
            if limit is not None and (not isinstance(limit, int) or limit <= 0):
                raise ValueError(f"{provider_id}.{field} must be null or a positive integer")
        if provider.get("maxPackageBytes") is not None:
            known_package_limits.append(provider["maxPackageBytes"])

    if not known_package_limits:
        raise ValueError("at least one provider must have a verified package limit")
    if budgets["maxTarballBytes"] >= min(known_package_limits):
        raise ValueError("tarball budget must leave headroom below the tightest provider limit")
    return budgets


def human_bytes(value: int) -> str:
    return f"{value / 1_000_000:.2f} MB"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Audit the files npm would publish against CDN delivery budgets."
    )
    parser.add_argument("package_ids", nargs="*", help="font ids; defaults to all")
    args = parser.parse_args()

    policy = load_json(POLICY_PATH)
    budgets = validate_policy(policy)
    registry = load_json(REGISTRY_PATH)
    known_ids = [font["id"] for font in registry["fonts"]]
    selected = args.package_ids or known_ids
    unknown = sorted(set(selected) - set(known_ids))
    if unknown:
        parser.error(f"unknown font ids: {', '.join(unknown)}")

    failures: list[str] = []
    for package_id in selected:
        result = pack_package(ROOT / "packages" / package_id)
        margin = budgets["maxTarballBytes"] - result.tarball_bytes
        print(
            f"{result.name}: tarball={human_bytes(result.tarball_bytes)}, "
            f"unpacked={human_bytes(result.unpacked_bytes)}, entries={result.entry_count}, "
            f"largest={result.largest_file_path} ({human_bytes(result.largest_file_bytes)}), "
            f"tarball budget margin={human_bytes(margin)}"
        )
        failures.extend(f"{result.name}: {message}" for message in evaluate(result, budgets))

    if failures:
        print("\nPackage delivery audit failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print(
            "Split the font family by a stable user-facing dimension before publishing.",
            file=sys.stderr,
        )
        raise SystemExit(1)

    limiting = min(
        (
            provider
            for provider in policy["providers"]
            if provider["maxPackageBytes"]
        ),
        key=lambda provider: provider["maxPackageBytes"],
    )
    print(
        f"audited {len(selected)} package(s); repository tarball budget "
        f"{human_bytes(budgets['maxTarballBytes'])} is below "
        f"{limiting['label']} limit {human_bytes(limiting['maxPackageBytes'])}"
    )


if __name__ == "__main__":
    main()
