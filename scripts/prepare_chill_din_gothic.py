#!/usr/bin/env python3
"""Rename the modified subset source while preserving copyright and license."""
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".work/chill-din-gothic"


def restore_license_metadata() -> None:
    with TTFont(WORK / "source/ChillDINGothic_Std.otf") as source:
        records = [record for record in source["name"].names if record.nameID in {13, 14}]
    for path in sorted((ROOT / "packages/chill-din-gothic/dist/Regular").glob("*.woff2")):
        with TTFont(path, recalcTimestamp=False) as font:
            for record in records:
                font["name"].setName(
                    record.toUnicode(), record.nameID, record.platformID,
                    record.platEncID, record.langID,
                )
            font.save(path)


def main() -> None:
    with TTFont(WORK / "source/ChillDINGothic_Std.otf", recalcTimestamp=False) as font:
        names = {
            1: "VP Industrial Gothic",
            2: "Regular",
            3: "VP Industrial Gothic 1.300 Regular",
            4: "VP Industrial Gothic Regular",
            6: "VPIndustrialGothic-Regular",
            16: "VP Industrial Gothic",
            17: "Regular",
        }
        for record in font["name"].names:
            if record.nameID in names:
                record.string = names[record.nameID].encode(record.getEncoding())
        cff = font["CFF "].cff
        cff.fontNames = [names[6]]
        cff.topDictIndex[0].FamilyName = names[1]
        cff.topDictIndex[0].FullName = names[4]
        font.save(WORK / "VPIndustrialGothic-Regular.otf")


if __name__ == "__main__":
    if sys.argv[1:] == ["restore-license"]:
        restore_license_metadata()
    elif not sys.argv[1:]:
        main()
    else:
        raise SystemExit("usage: prepare_chill_din_gothic.py [restore-license]")
