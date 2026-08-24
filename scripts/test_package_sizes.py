#!/usr/bin/env python3

from __future__ import annotations

import unittest

from audit_package_sizes import PackResult, evaluate, validate_policy


class PackageSizeTest(unittest.TestCase):
    budgets = {
        "maxTarballBytes": 140,
        "maxUnpackedBytes": 140,
        "maxFileBytes": 20,
    }

    def result(self, *, tarball: int = 140, unpacked: int = 140, file: int = 20) -> PackResult:
        return PackResult("example", tarball, unpacked, "dist/font.woff2", file, 1)

    def test_values_at_budgets_pass(self) -> None:
        self.assertEqual(evaluate(self.result(), self.budgets), [])

    def test_each_budget_is_enforced(self) -> None:
        failures = evaluate(self.result(tarball=141, unpacked=142, file=21), self.budgets)
        self.assertEqual(len(failures), 3)
        self.assertIn("tarball", failures[0])
        self.assertIn("unpacked package", failures[1])
        self.assertIn("dist/font.woff2", failures[2])

    def test_policy_requires_headroom(self) -> None:
        policy = {
            "schemaVersion": 1,
            "budgets": self.budgets,
            "providers": [{
                "id": "cdn",
                "label": "CDN",
                "source": "https://example.com",
                "checkedOn": "2026-08-24",
                "notes": "fixture",
                "maxPackageBytes": 140,
                "maxFileBytes": None,
            }],
        }
        with self.assertRaisesRegex(ValueError, "leave headroom"):
            validate_policy(policy)


if __name__ == "__main__":
    unittest.main()
