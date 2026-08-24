#!/usr/bin/env python3

from __future__ import annotations

import json
import unittest
from pathlib import Path

from select_ci_fonts import select_fonts

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = json.loads((ROOT / "fonts.json").read_text(encoding="utf-8"))
ALL_FONT_IDS = [font["id"] for font in REGISTRY["fonts"]]


def selected_ids(paths: set[str]) -> list[str]:
    return [font["id"] for font in select_fonts(REGISTRY, paths)]


class SelectionTest(unittest.TestCase):
    def test_common_input_selects_every_font(self) -> None:
        self.assertEqual(selected_ids({"scripts/fetch_source.py"}), ALL_FONT_IDS)

    def test_source_manifest_selects_one_font(self) -> None:
        self.assertEqual(
            selected_ids({"packages/hanamin/source.json"}),
            ["hanamin"],
        )

    def test_generated_file_selects_one_font(self) -> None:
        self.assertEqual(
            selected_ids({"packages/jigmo/dist/index.css"}),
            ["jigmo"],
        )

    def test_build_script_selects_one_font(self) -> None:
        self.assertEqual(
            selected_ids({"scripts/build-taipei-sans-tc.sh"}),
            ["taipei-sans-tc"],
        )

    def test_shared_glow_sans_build_input_selects_all_widths(self) -> None:
        expected = [
            "glow-sans-tc-compressed",
            "glow-sans-tc-condensed",
            "glow-sans-tc-normal",
            "glow-sans-tc-extended",
            "glow-sans-tc-wide",
        ]
        self.assertEqual(selected_ids({"scripts/build-glow-sans-tc-width.sh"}), expected)
        self.assertEqual(selected_ids({"licenses/glow-sans-OFL.txt"}), expected)

    def test_version_and_changelog_only_select_no_fonts(self) -> None:
        self.assertEqual(
            selected_ids(
                {
                    "packages/fusion-pixel-font/package.json",
                    "packages/fusion-pixel-font/CHANGELOG.md",
                }
            ),
            [],
        )

    def test_registry_metadata_only_selects_no_fonts(self) -> None:
        self.assertEqual(selected_ids({"fonts.json"}), [])

    def test_unrelated_docs_select_no_fonts(self) -> None:
        self.assertEqual(selected_ids({"README.md"}), [])


if __name__ == "__main__":
    unittest.main()
