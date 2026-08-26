#!/usr/bin/env node

import { globSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(readFileSync(join(root, "fonts.json"), "utf8"));
const outputPath = join(root, "site/generated/fonts.json");

const cdns = [
  {
    id: "jsdelivr",
    label: "jsDelivr",
    baseUrl: "https://cdn.jsdelivr.net/npm",
    note: "Permanent npm cache and the recommended default.",
  },
  {
    id: "unpkg",
    label: "UNPKG",
    baseUrl: "https://unpkg.com",
    note: "Versioned npm files delivered through Cloudflare.",
  },
  {
    id: "statically",
    label: "Statically",
    baseUrl: "https://cdn.statically.io/npm",
    note: "A public CDN for versioned npm static assets.",
  },
];

function parseRange(token) {
  const value = token.trim().toUpperCase().replace(/^U\+/, "");
  if (value.includes("?")) {
    return [
      Number.parseInt(value.replaceAll("?", "0"), 16),
      Number.parseInt(value.replaceAll("?", "F"), 16),
    ];
  }
  if (value.includes("-")) {
    return value.split("-", 2).map((part) => Number.parseInt(part, 16));
  }
  const point = Number.parseInt(value, 16);
  return [point, point];
}

function mergeRanges(ranges) {
  const sorted = ranges.toSorted((left, right) => left[0] - right[0]);
  const merged = [];
  for (const [start, end] of sorted) {
    const previous = merged.at(-1);
    if (previous && start <= previous[1] + 1) {
      previous[1] = Math.max(previous[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

function coverageFromCss(paths) {
  const ranges = [];
  for (const path of paths) {
    const css = readFileSync(path, "utf8");
    for (const match of css.matchAll(/unicode-range:\s*([^;]+)/giu)) {
      ranges.push(...match[1].split(",").map(parseRange));
    }
  }
  return mergeRanges(ranges);
}

function variantCoveragePaths(packageDir, variant) {
  if (variant.coverageCss) {
    return variant.coverageCss.map((path) => join(packageDir, path));
  }
  if (variant.coverageGlob) {
    return globSync(join(packageDir, variant.coverageGlob));
  }
  throw new Error(`variant ${variant.id} needs coverageCss or coverageGlob`);
}

const fonts = registry.fonts.map((font) => {
  const packageDir = join(root, "packages", font.id);
  const packageJson = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
  if (!font.site) throw new Error(`${font.id} is missing site metadata`);

  return {
    id: font.id,
    label: font.label,
    packageName: packageJson.name,
    version: packageJson.version,
    description: font.site.description,
    license: font.site.license,
    sourceUrl: font.site.sourceUrl,
    repositoryUrl: packageJson.homepage,
    family: font.site.family ?? null,
    variants: font.site.variants.map((variant) => {
      const coverage = coverageFromCss(variantCoveragePaths(packageDir, variant));
      const characterCount = coverage.reduce((total, [start, end]) => total + end - start + 1, 0);
      const urls = Object.fromEntries(
        cdns.map((cdn) => [
          cdn.id,
          `${cdn.baseUrl}/${packageJson.name}@${packageJson.version}/${variant.css}`,
        ]),
      );
      return {
        id: variant.id,
        label: variant.label,
        families: variant.families,
        weight: variant.weight,
        style: variant.style ?? "normal",
        stretch: variant.stretch ?? "normal",
        cssPath: variant.css,
        urls,
        coverage,
        characterCount,
      };
    }),
  };
});

const output = `${JSON.stringify({ cdns, fonts })}\n`;
if (process.argv.includes("--check")) {
  const current = readFileSync(outputPath, "utf8");
  if (current !== output) {
    console.error(`${relative(root, outputPath)} is stale; run pnpm site:data and commit it`);
    process.exit(1);
  }
} else {
  writeFileSync(outputPath, output);
  console.log(`generated ${fonts.length} fonts in ${relative(root, outputPath)}`);
}
