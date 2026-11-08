#!/usr/bin/env python3

from __future__ import annotations

import re
from pathlib import Path

from fontTools.ttLib import TTFont

from audit_hanamin import css_codepoints, inspect_font

ROOT = Path(__file__).resolve().parents[1]
FAMILY = "VP Industrial Gothic"
POSTSCRIPT_NAME = "VPIndustrialGothic-Regular"


def main() -> None:
    source_path = ROOT / ".work/chill-din-gothic/source/ChillDINGothic_Std.otf"
    output_dir = ROOT / "packages/chill-din-gothic/dist/Regular"
    css_path = output_dir / "VP-Industrial-Gothic.css"
    css = css_path.read_text(encoding="utf-8")
    source_points, source_sequences = inspect_font(source_path)
    with TTFont(source_path) as source:
        preserved = {
            (record.nameID, record.toUnicode())
            for record in source["name"].names
            if record.nameID in {0, 13, 14}
        }
        assert source["OS/2"].usWeightClass == 500, "upstream weight changed"
    faces = re.findall(r"@font-face\s*\{([^}]+)\}", css)
    assert faces, "missing font faces"
    referenced = set()
    output_points = set()
    output_sequences = set()
    for face in faces:
        match = re.search(r'url\([\'"]?([^\)\'\"]+)', face)
        assert match, "missing font URL"
        filename = match[1]
        assert Path(filename).name == filename, "unexpected font path"
        path = output_dir / filename
        assert path.suffix == ".woff2", "unexpected font format"
        referenced.add(path)
        points, sequences = inspect_font(path)
        output_sequences.update(sequences)
        # Check each descriptor independently: a union alone hides swapped subsets.
        descriptor = re.search(r"unicode-range:\s*([^;]+)", face)
        assert descriptor, "missing unicode-range"
        declared = set()
        for item in descriptor[1].split(","):
            bounds = item.strip().upper().removeprefix("U+").split("-")
            declared.update(range(int(bounds[0], 16), int(bounds[-1], 16) + 1))
        assert all(base in declared for base, _, _ in sequences), "variation sequence in wrong subset"
        assert points == declared, f"CSS coverage differs: {filename}"
        assert f'font-family: "{FAMILY}";' in face, "wrong CSS family"
        assert "font-weight: 500;" in face, "wrong CSS weight"
        assert "font-style: normal;" in face, "wrong CSS style"
        with TTFont(path) as font:
            names = {(n.nameID, n.toUnicode()) for n in font["name"].names}
            assert preserved <= names, f"lost copyright/license: {filename}"
            assert font["OS/2"].usWeightClass == 500, "wrong font weight"
            expected = {1: FAMILY, 4: f"{FAMILY} Regular", 6: POSTSCRIPT_NAME, 16: FAMILY}
            for name_id, name in expected.items():
                values = {value for key, value in names if key == name_id}
                if values or name_id != 16:
                    assert values == {name}, f"wrong internal name {name_id}: {values}"
            cff = font["CFF "].cff
            assert cff.fontNames == [POSTSCRIPT_NAME], "wrong CFF PostScript name"
            assert cff.topDictIndex[0].FamilyName == FAMILY, "wrong CFF family"
        output_points.update(points)
    assert referenced == set(output_dir.glob("*.woff2")), "unreferenced or missing subsets"
    assert source_points == output_points == css_codepoints(css_path), "coverage differs"
    assert source_sequences == output_sequences, "variation sequence coverage differs"
    assert len(source_sequences) == 2, "unexpected source variation sequences"
    assert len(source_points) == 30545, "unexpected source coverage"
    assert (output_dir.parent / "index.css").read_text() == '@import url("./Regular/VP-Industrial-Gothic.css");\n', "wrong entry point"
    assert (output_dir.parents[1] / "LICENSE.font.txt").read_bytes() == (source_path.parent / "license").read_bytes(), "license differs"
    print(f"ChillDINGothic: {len(source_points)} codepoints, {len(referenced)} WOFF2 subsets; 2 variation sequences; coverage, weight, names, and license verified")


if __name__ == "__main__":
    main()
