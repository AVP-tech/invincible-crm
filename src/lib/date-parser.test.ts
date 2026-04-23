import { describe, expect, it } from "vitest";
import { resolveRelativeDate } from "@/lib/date-parser";

describe("resolveRelativeDate", () => {
  const baseDate = new Date("2026-04-01T09:00:00.000Z");

  it("parses tomorrow", () => {
    const result = resolveRelativeDate("Call Rahul tomorrow", baseDate);

    expect(result.matchedText).toBe("tomorrow");
    expect(result.date?.getDate()).toBe(2);
    expect(result.date?.getHours()).toBe(9);
  });

  it("parses next weekday", () => {
    const result = resolveRelativeDate("Follow up next Monday", baseDate);

    expect(result.matchedText).toBe("next monday");
    expect(result.date?.getDate()).toBe(13);
  });

  it("parses calendar dates with month names", () => {
    const result = resolveRelativeDate("Send proposal on 12 April", baseDate);

    expect(result.matchedText).toBe("on 12 april");
    expect(result.date?.getDate()).toBe(12);
    expect(result.date?.getMonth()).toBe(3);
  });

  it("defaults morning, afternoon, and evening to business-friendly hours", () => {
    const morning = resolveRelativeDate("Check invoice status on Thursday morning", baseDate);
    const afternoon = resolveRelativeDate("Follow up next Monday afternoon", baseDate);
    const evening = resolveRelativeDate("Send proposal Friday evening", baseDate);

    expect(morning.date?.getHours()).toBe(8);
    expect(afternoon.date?.getHours()).toBe(12);
    expect(evening.date?.getHours()).toBe(16);
  });

  it("captures explicit times attached to relative dates", () => {
    const result = resolveRelativeDate("Follow up with Rahul tomorrow at 10 AM", baseDate);

    expect(result.date?.getDate()).toBe(2);
    expect(result.date?.getHours()).toBe(10);
    expect(result.date?.getMinutes()).toBe(0);
  });
});
