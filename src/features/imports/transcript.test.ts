import { describe, expect, it } from "vitest";
import { parseTranscriptPreview } from "@/features/imports/transcript";

describe("parseTranscriptPreview", () => {
  it("creates a usable fallback transcript import preview", async () => {
    const transcript = [
      "Neha: We want a faster website redesign for ABC Studio.",
      "You: We can share a proposal by Friday.",
      "Neha: Our budget is around 80k and we want to move this month."
    ].join("\n");

    const preview = await parseTranscriptPreview("test-user", transcript, new Date("2026-04-01T09:00:00.000Z"));

    expect(preview.summary.length).toBeGreaterThan(20);
    expect(preview.preview.contact?.name).toBe("Neha");
    expect(preview.preview.deal?.amount).toBe(80000);
    expect(preview.actionItems.join(" ")).toMatch(/proposal|friday/i);
  });
});
