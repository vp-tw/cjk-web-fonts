import { mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getManifest } from "workbox-build";

// Exercise the real consumer when changing Workbox's scoped glob override.
describe("Workbox precache file selection", () => {
  let directory;
  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "workbox-glob-"));
    for (const file of [
      "index.html",
      "zh-hant/index.html",
      "ja/index.html",
      "_astro/app.js",
      "_astro/nested/app.css",
      "_astro/ignored.js",
      "_astro/.hidden.js",
      "font.woff2",
    ]) {
      await mkdir(dirname(join(directory, file)), { recursive: true });
      await writeFile(join(directory, file), "fixture");
    }
    await mkdir(join(directory, "_astro/directory.js"));
    await symlink("_astro", join(directory, "linked"), "dir");
  });
  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it("preserves brace, globstar, ignore and directory filtering", async () => {
    const result = await getManifest({
      globDirectory: directory,
      globPatterns: ["index.html", "{zh-hant,ja}/index.html", "_astro/**/*.{js,css}"],
      globIgnores: ["**/ignored.js"],
    });
    expect(result.warnings).toEqual([]);
    expect(result.manifestEntries.map(({ url }) => url).sort()).toEqual([
      "_astro/app.js",
      "_astro/nested/app.css",
      "index.html",
      "ja/index.html",
      "zh-hant/index.html",
    ]);
  });

  it.each([false, true])("respects globFollow=%s", async (globFollow) => {
    const result = await getManifest({
      globDirectory: directory,
      globPatterns: ["**/*.css"],
      globFollow,
    });
    expect(result.warnings).toEqual([]);
    expect(result.manifestEntries.map(({ url }) => url).sort()).toEqual(
      globFollow ? ["_astro/nested/app.css", "linked/nested/app.css"] : ["_astro/nested/app.css"],
    );
  });

  it("keeps unmatched patterns observable as warnings", async () => {
    const result = await getManifest({ globDirectory: directory, globPatterns: ["missing/**"] });
    expect(result.manifestEntries).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("doesn't match any files");
  });

  it("rejects invalid pattern input", async () => {
    await expect(getManifest({ globDirectory: directory, globPatterns: [42] })).rejects.toThrow();
  });
});
