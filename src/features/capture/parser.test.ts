import { describe, expect, it } from "vitest";
import { fallbackParseCapture } from "@/features/capture/parser";

describe("fallbackParseCapture", () => {
  it("extracts contact, task, and date for a simple follow-up", () => {
    const preview = fallbackParseCapture("Call Rahul tomorrow about the proposal", new Date("2026-04-01T09:00:00.000Z"));

    expect(preview.contact?.name).toBe("Rahul");
    expect(preview.task?.title).toBe("Call Rahul");
    expect(preview.task?.dueDate ? new Date(preview.task.dueDate).getDate() : null).toBe(2);
    expect(preview.deal?.stage).toBe("PROPOSAL_SENT");
  });

  it("extracts amount and company for a richer note", () => {
    const preview = fallbackParseCapture(
      "Met Neha today from ABC Studio, interested in website redesign, budget 80k, send proposal Friday",
      new Date("2026-04-01T09:00:00.000Z")
    );

    expect(preview.contact?.name).toBe("Neha");
    expect(preview.contact?.companyName).toBe("ABC Studio");
    expect(preview.deal?.amount).toBe(80000);
    expect(preview.task?.title).toBe("Send proposal to Neha");
  });

  it("prefers contextual amounts over unrelated numbers", () => {
    const preview = fallbackParseCapture(
      "Follow up with Neha in 2 days about the website redesign, budget 1.5 lakh, send quote Monday",
      new Date("2026-04-01T09:00:00.000Z")
    );

    expect(preview.deal?.amount).toBe(150000);
    expect(preview.task?.dueDate ? new Date(preview.task.dueDate).getDate() : null).toBe(3);
    expect(preview.missingFields).toContain("Task priority");
  });
});
