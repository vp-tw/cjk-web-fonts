#!/usr/bin/env python3

from __future__ import annotations

import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "fonts.json"
SIZE_POLICY_PATH = ROOT / "package-size-policy.json"
PACKAGE_PREFIX = "@vp-tw/cjk-web-fonts-"
FONTSOURCE_CLASSIFICATIONS = {
    "display",
    "handwriting",
    "monospace",
    "sans-serif",
    "serif",
    "slab-serif",
    "symbols",
}
CATALOG_ROLES = {"diagnostic", "text"}
CATALOG_LANGUAGE_IDS = {
    "en_Latn",
    "ja_Jpan",
    "ko_Kore",
    "yue_Hant",
    "zh_Hans",
    "zh_Hant",
}
CATALOG_WRITING_SYSTEM_IDS = {
    "bopomofo",
    "han",
    "hangul",
    "hiragana",
    "katakana",
    "latin",
    "symbols",
}
DIAGNOSTIC_TYPES = {"last-resort", "notdef", "tofu"}


def fail(message: str) -> None:
    raise SystemExit(f"workspace validation failed: {message}")


def main() -> None:
    registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    from audit_package_sizes import validate_policy

    validate_policy(json.loads(SIZE_POLICY_PATH.read_text(encoding="utf-8")))
    fonts = registry.get("fonts")
    if not isinstance(fonts, list) or not fonts:
        fail("fonts.json must contain a non-empty fonts array")
    writing_systems = registry.get("writingSystems")
    if not isinstance(writing_systems, list) or not writing_systems:
        fail("fonts.json must contain writing-system samples")
    writing_system_ids: set[str] = set()
    for writing_system in writing_systems:
        writing_system_id = writing_system.get("id")
        if not isinstance(writing_system_id, str) or not writing_system_id:
            fail("every writing system needs a non-empty id")
        if writing_system_id in writing_system_ids:
            fail(f"duplicate writing system id: {writing_system_id}")
        writing_system_ids.add(writing_system_id)
        if not isinstance(writing_system.get("sample"), str) or not writing_system["sample"]:
            fail(f"writing system {writing_system_id} needs a non-empty sample")
    if writing_system_ids != CATALOG_WRITING_SYSTEM_IDS:
        fail("fonts.json writing-system ids must match the catalog contract")

    root_package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    root_scripts = root_package.get("scripts", {})
    seen_ids: set[str] = set()
    expected_package_dirs: set[str] = set()
    expected_build_commands: list[str] = []
    catalog_families: dict[str, list[tuple[str, dict]]] = {}

    for index, font in enumerate(fonts):
        if not isinstance(font, dict):
            fail(f"fonts[{index}] must be an object")
        missing_fields = {
            "id",
            "label",
            "buildScript",
            "auditScript",
        } - font.keys()
        if missing_fields:
            fail(f"fonts[{index}] misses {sorted(missing_fields)}")

        font_id = font["id"]
        if not isinstance(font_id, str) or not font_id:
            fail(f"fonts[{index}].id must be a non-empty string")
        if font_id in seen_ids:
            fail(f"duplicate font id: {font_id}")
        seen_ids.add(font_id)
        expected_package_dirs.add(font_id)

        package_dir = ROOT / "packages" / font_id
        package_path = package_dir / "package.json"
        if not package_path.is_file():
            fail(f"missing package.json for {font_id}")
        package = json.loads(package_path.read_text(encoding="utf-8"))
        expected_name = f"{PACKAGE_PREFIX}{font_id}"
        if package.get("name") != expected_name:
            fail(f"{font_id} package name must be {expected_name}")

        readme_path = package_dir / "README.md"
        if not readme_path.is_file():
            fail(f"missing README.md for {font_id}")
        readme = readme_path.read_text(encoding="utf-8")
        if expected_name not in readme:
            fail(f"{font_id} README must mention {expected_name}")

        for field in ("buildScript", "auditScript"):
            relative_path = font[field]
            if not isinstance(relative_path, str) or not relative_path:
                fail(f"{font_id}.{field} must be a non-empty string")
            script_path = ROOT / relative_path
            if not script_path.is_file():
                fail(f"missing {field} for {font_id}: {relative_path}")
            if not os.access(script_path, os.X_OK):
                fail(f"{relative_path} must be executable")

        build_inputs = font.get("buildInputs", [])
        if not isinstance(build_inputs, list):
            fail(f"{font_id}.buildInputs must be an array")
        for relative_path in build_inputs:
            if not isinstance(relative_path, str) or not (ROOT / relative_path).is_file():
                fail(f"{font_id}.buildInputs contains a missing file: {relative_path!r}")

        build_command = f"./{font['buildScript']}"
        expected_build_commands.append(f"pnpm build:{font_id}")
        if root_scripts.get(f"build:{font_id}") != build_command:
            fail(f"package.json build:{font_id} must be {build_command}")

        site = font.get("site")
        if not isinstance(site, dict):
            fail(f"{font_id}.site must contain catalog metadata")
        for field in ("description", "license", "sourceUrl"):
            if not isinstance(site.get(field), str) or not site[field]:
                fail(f"{font_id}.site.{field} must be a non-empty string")
        official_names = site.get("officialNames")
        if (
            not isinstance(official_names, dict)
            or not official_names
            or any(
                not isinstance(locale, str)
                or not locale
                or not isinstance(name, str)
                or not name
                for locale, name in official_names.items()
            )
        ):
            fail(f"{font_id}.site.officialNames must map locales to non-empty names")
        classifications = site.get("classifications")
        if (
            not isinstance(classifications, list)
            or not classifications
            or any(value not in FONTSOURCE_CLASSIFICATIONS for value in classifications)
            or len(classifications) != len(set(classifications))
        ):
            fail(f"{font_id}.site.classifications must use unique Fontsource values")
        roles = site.get("roles")
        if (
            not isinstance(roles, list)
            or not roles
            or any(value not in CATALOG_ROLES for value in roles)
            or len(roles) != len(set(roles))
        ):
            fail(f"{font_id}.site.roles contains unsupported or duplicate values")
        languages = site.get("languages")
        if (
            not isinstance(languages, list)
            or any(value not in CATALOG_LANGUAGE_IDS for value in languages)
            or len(languages) != len(set(languages))
        ):
            fail(f"{font_id}.site.languages must use unique supported Fontsource ids")
        diagnostic_type = site.get("diagnosticType")
        if ("diagnostic" in roles) != (diagnostic_type in DIAGNOSTIC_TYPES):
            fail(f"{font_id}.site.diagnosticType must be set only for diagnostic fonts")
        family = site.get("family")
        if family is not None:
            for field in ("id", "label", "axisLabel", "value", "valueLabel"):
                if not isinstance(family.get(field), str) or not family[field]:
                    fail(f"{font_id}.site.family.{field} must be a non-empty string")
            if not isinstance(family.get("order"), int) or family["order"] < 0:
                fail(f"{font_id}.site.family.order must be a non-negative integer")
            if not isinstance(family.get("default"), bool):
                fail(f"{font_id}.site.family.default must be a boolean")
            family_official_names = family.get("officialNames")
            if (
                family_official_names is not None
                and (
                    not isinstance(family_official_names, dict)
                    or not family_official_names
                    or any(
                        not isinstance(locale, str)
                        or not locale
                        or not isinstance(name, str)
                        or not name
                        for locale, name in family_official_names.items()
                    )
                )
            ):
                fail(
                    f"{font_id}.site.family.officialNames must map locales to non-empty names"
                )
            catalog_families.setdefault(family["id"], []).append((font_id, family))
        variants = site.get("variants")
        if not isinstance(variants, list) or not variants:
            fail(f"{font_id}.site.variants must be a non-empty array")
        variant_ids: set[str] = set()
        resolved_variant_classifications: set[str] = set()
        for variant in variants:
            variant_id = variant.get("id")
            if not isinstance(variant_id, str) or not variant_id:
                fail(f"{font_id} has a variant without an id")
            if variant_id in variant_ids:
                fail(f"{font_id} has duplicate variant id {variant_id}")
            variant_ids.add(variant_id)
            variant_classifications = variant.get("classifications", classifications)
            if (
                not isinstance(variant_classifications, list)
                or not variant_classifications
                or any(
                    value not in FONTSOURCE_CLASSIFICATIONS
                    for value in variant_classifications
                )
                or len(variant_classifications) != len(set(variant_classifications))
            ):
                fail(
                    f"{font_id}.{variant_id}.classifications must use unique "
                    "Fontsource values"
                )
            resolved_variant_classifications.update(variant_classifications)
            css_path = variant.get("css")
            if not isinstance(css_path, str) or not (package_dir / css_path).is_file():
                fail(f"{font_id}.{variant_id} CSS does not exist: {css_path!r}")
            coverage_css = variant.get("coverageCss")
            coverage_glob = variant.get("coverageGlob")
            if bool(coverage_css) == bool(coverage_glob):
                fail(
                    f"{font_id}.{variant_id} needs exactly one coverageCss or coverageGlob"
                )
            if coverage_css and any(
                not (package_dir / path).is_file() for path in coverage_css
            ):
                fail(f"{font_id}.{variant_id} coverageCss contains a missing file")
            if coverage_glob and not list(package_dir.glob(coverage_glob)):
                fail(f"{font_id}.{variant_id} coverageGlob matches no files")
            stretch = variant.get("stretch", "normal")
            if not isinstance(stretch, str) or not stretch:
                fail(f"{font_id}.{variant_id} stretch must be a non-empty string")
        if resolved_variant_classifications != set(classifications):
            fail(
                f"{font_id}.site.classifications must equal the resolved variant union"
            )

    for family_id, members in catalog_families.items():
        if len(members) < 2:
            fail(f"catalog family {family_id} must contain at least two packages")
        defaults = [font_id for font_id, family in members if family["default"]]
        if len(defaults) != 1:
            fail(f"catalog family {family_id} needs exactly one default package")
        values = [family["value"] for _, family in members]
        orders = [family["order"] for _, family in members]
        if len(values) != len(set(values)):
            fail(f"catalog family {family_id} has duplicate values")
        if len(orders) != len(set(orders)):
            fail(f"catalog family {family_id} has duplicate order values")

    actual_package_dirs = {
        path.parent.name for path in (ROOT / "packages").glob("*/package.json")
    }
    if actual_package_dirs != expected_package_dirs:
        fail(
            "fonts.json package coverage differs: "
            f"missing={sorted(actual_package_dirs - expected_package_dirs)}, "
            f"extra={sorted(expected_package_dirs - actual_package_dirs)}"
        )

    expected_build = " && ".join(expected_build_commands)
    if root_scripts.get("build") != expected_build:
        fail(f"package.json build must be: {expected_build}")
    if root_scripts.get("release:publish") != "changeset publish":
        fail("release:publish must be exactly 'changeset publish'")
    root_check = root_scripts.get("check", "")
    for required_command in (
        "pnpm validate:workspace",
        "pnpm test",
        "pnpm site:data:check",
        "pnpm site:check",
    ):
        if required_command not in root_check:
            fail(f"package.json check must run {required_command}")
    if root_scripts.get("audit:packages") != "python3 scripts/audit_package_sizes.py":
        fail("package.json audit:packages must run the repository package audit")

    if not (ROOT / "AGENTS.md").is_file():
        fail("AGENTS.md must document workspace invariants for coding agents")
    for design_file in ("PRODUCT.md", "DESIGN.md", ".impeccable/design.json"):
        if not (ROOT / design_file).is_file():
            fail(f"{design_file} must preserve the catalog design contract")

    release_workflow = (ROOT / ".github/workflows/release.yml").read_text(
        encoding="utf-8"
    )
    ci_workflow = (ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8")
    forbidden_release_commands = [
        "pnpm build",
        *[font["buildScript"] for font in fonts],
        *[
            path
            for font in fonts
            for path in font.get("buildInputs", [])
        ],
    ]
    for command in forbidden_release_commands:
        if command in release_workflow:
            fail(f"release workflow must not rebuild fonts: found {command}")
    if "pnpm audit:packages" not in release_workflow:
        fail("release workflow must audit package delivery sizes before publishing")
    if release_workflow.index("pnpm audit:packages") > release_workflow.index(
        "changesets/action"
    ):
        fail("release workflow must audit package sizes before Changesets")
    if "python3 scripts/audit_package_sizes.py" not in ci_workflow:
        fail("CI must audit every publishable package")
    if "python3 scripts/audit_package_sizes.py \"${{ matrix.font.id }}\"" not in ci_workflow:
        fail("CI must audit each affected package after rebuilding it")

    root_readme = (ROOT / "README.md").read_text(encoding="utf-8")
    for font_id in seen_ids:
        if f"packages/{font_id}/README.md" not in root_readme:
            fail(f"root README must link packages/{font_id}/README.md")
        if f"{PACKAGE_PREFIX}{font_id}" not in root_readme:
            fail(f"root README must mention {PACKAGE_PREFIX}{font_id}")

    common_inputs = registry.get("commonBuildInputs")
    if not isinstance(common_inputs, list) or not common_inputs:
        fail("commonBuildInputs must be a non-empty array")
    for relative_path in common_inputs:
        if not isinstance(relative_path, str) or not (ROOT / relative_path).exists():
            fail(f"common build input does not exist: {relative_path!r}")

    print(f"validated {len(fonts)} font packages")


if __name__ == "__main__":
    main()
