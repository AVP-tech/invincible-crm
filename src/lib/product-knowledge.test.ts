import { describe, expect, it } from "vitest";
import { getRelevantProductKnowledgeContext } from "@/lib/product-knowledge";

describe("product knowledge retrieval", () => {
  it("returns pricing context for pricing questions", () => {
    const context = getRelevantProductKnowledgeContext(
      "what are your pricing plans?"
    );

    expect(context).toContain("[Pricing and plans]");
    expect(context).toContain("Rs 499/month");
    expect(context).toContain("Rs 999/month");
  });

  it("returns WhatsApp workflow context for chat-driven sales questions", () => {
    const context = getRelevantProductKnowledgeContext(
      "we sell mostly on whatsapp and need follow-up reminders"
    );

    expect(context).toContain("[WhatsApp CRM workflow]");
    expect(context).toContain("turn WhatsApp conversations into structured contacts");
  });

  it("returns onboarding context for demo and setup questions", () => {
    const context = getRelevantProductKnowledgeContext(
      "can I book a demo and how long does setup take?"
    );

    expect(context).toContain("[Guided onboarding and demo]");
    expect(context).toContain("free 10-minute onboarding video call");
    expect(context).toContain("Average setup time is 8 minutes");
  });
});
