#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZERO_SHA = "0" * 40


def changed_files(base: str, head: str) -> set[str]:
    if not base or base == ZERO_SHA:
        return {"fonts.json"}
    result = subprocess.run(
        ["git", "diff", "--name-only", f"{base}...{head}"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return {line for line in result.stdout.splitlines() if line}


def select_fonts(
    registry: dict[str, object], paths: set[str]
) -> list[dict[str, str]]:
    common_inputs = set(registry["commonBuildInputs"])
    build_all = bool(paths & common_inputs)
    selected: list[dict[str, str]] = []

    for font in registry["fonts"]:
        font_id = font["id"]
        package_source = f"packages/{font_id}/source.json"
        package_dist_prefix = f"packages/{font_id}/dist/"
        inputs = {
            font["buildScript"],
            font["auditScript"],
            package_source,
            *font.get("buildInputs", []),
        }
        affected = (
            build_all
            or bool(paths & inputs)
            or any(path.startswith(package_dist_prefix) for path in paths)
        )
        if affected:
            selected.append(
                {
                    "id": font_id,
                    "label": font["label"],
                    "command": f"./{font['buildScript']}",
                }
            )
    return selected


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", required=True)
    parser.add_argument("--github-output", action="store_true")
    args = parser.parse_args()

    registry = json.loads((ROOT / "fonts.json").read_text(encoding="utf-8"))
    paths = changed_files(args.base, args.head)
    selected = select_fonts(registry, paths)

    output = json.dumps(selected, separators=(",", ":"))
    if args.github_output:
        print(f"fonts={output}")
        print(f"count={len(selected)}")
    else:
        print(output)


if __name__ == "__main__":
    main()
