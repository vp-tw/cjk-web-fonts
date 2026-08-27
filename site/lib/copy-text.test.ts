import { describe, expect, it, vi } from "vitest";

import { copyText } from "./copy-text";

describe("copyText", () => {
  it("uses the Clipboard API when it succeeds", async () => {
    const clipboard = vi.fn().mockResolvedValue(undefined);
    const fallback = vi.fn(() => true);

    await expect(copyText("example", { clipboard, fallback })).resolves.toBe(true);
    expect(fallback).not.toHaveBeenCalled();
  });

  it("reports a successful fallback", async () => {
    await expect(
      copyText("example", {
        clipboard: vi.fn().mockRejectedValue(new Error("denied")),
        fallback: vi.fn(() => true),
      }),
    ).resolves.toBe(true);
  });

  it("reports a failed fallback", async () => {
    await expect(
      copyText("example", {
        clipboard: vi.fn().mockRejectedValue(new Error("denied")),
        fallback: vi.fn(() => false),
      }),
    ).resolves.toBe(false);
  });

  it("contains fallback exceptions", async () => {
    await expect(
      copyText("example", {
        clipboard: vi.fn().mockRejectedValue(new Error("denied")),
        fallback: vi.fn(() => {
          throw new Error("unavailable");
        }),
      }),
    ).resolves.toBe(false);
  });
});
