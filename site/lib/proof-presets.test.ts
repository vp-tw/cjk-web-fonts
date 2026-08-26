import { describe, expect, it } from "vitest";

import {
  composeProofText,
  proofPresets,
  selectedPresetCount,
  textForSelection,
  toggleProofPreset,
  type ProofPresetSelection,
} from "./proof-presets";

describe("proof presets", () => {
  it("composes selected presets in the published order", () => {
    const text = composeProofText(["symbols", "latin"]);

    expect(text.indexOf("ABC xyz")).toBeLessThan(text.indexOf("!? …"));
  });

  it("uses every preset for the all selection", () => {
    const selection: ProofPresetSelection = { mode: "all" };

    expect(textForSelection(selection)).toBe(composeProofText(proofPresets.map(({ id }) => id)));
    expect(selectedPresetCount(selection)).toBe(proofPresets.length);
  });

  it("starts an individual selection when toggled from all or custom", () => {
    expect(toggleProofPreset({ mode: "all" }, "latin")).toEqual({
      mode: "selected",
      ids: ["latin"],
    });
    expect(toggleProofPreset({ mode: "custom" }, "symbols")).toEqual({
      mode: "selected",
      ids: ["symbols"],
    });
  });

  it("returns to all when the final individual preset is cleared", () => {
    expect(toggleProofPreset({ mode: "selected", ids: ["latin"] }, "latin")).toEqual({
      mode: "all",
    });
  });

  it("adds and removes presets while preserving published order", () => {
    const first = toggleProofPreset({ mode: "selected", ids: ["symbols"] }, "latin");
    expect(first).toEqual({ mode: "selected", ids: ["latin", "symbols"] });
    expect(toggleProofPreset(first, "symbols")).toEqual({ mode: "selected", ids: ["latin"] });
  });

  it("does not replace custom text", () => {
    expect(textForSelection({ mode: "custom" })).toBeNull();
    expect(selectedPresetCount({ mode: "custom" })).toBe(0);
  });
});
