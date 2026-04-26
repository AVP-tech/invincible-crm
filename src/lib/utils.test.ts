import { describe, expect, it } from "vitest";
import { invoiceInputSchema } from "@/lib/schemas";
import { formatCurrency, normalizeCurrencyCode, supportedCurrencyCodes } from "@/lib/utils";

describe("currency helpers", () => {
  it("normalizes currency codes before using them", () => {
    expect(normalizeCurrencyCode(" usd ")).toBe("USD");
    expect(normalizeCurrencyCode("")).toBe("INR");
  });

  it("does not throw when the currency code is incomplete or invalid", () => {
    expect(formatCurrency(12500, "US")).toBe("US 12,500");
    expect(formatCurrency(12500, "RUPEES")).toBe("RUPEES 12,500");
  });

  it("accepts normalized invoice currencies and rejects malformed ones", () => {
    const validInvoice = invoiceInputSchema.safeParse({
      number: "INV-001",
      clientName: "TechSoft",
      amount: 15000,
      currency: "usd",
      status: "DRAFT"
    });
    const invalidInvoice = invoiceInputSchema.safeParse({
      number: "INV-002",
      clientName: "TechSoft",
      amount: 15000,
      currency: "rupees",
      status: "DRAFT"
    });

    expect(validInvoice.success).toBe(true);
    expect(validInvoice.success ? validInvoice.data.currency : undefined).toBe("USD");
    expect(invalidInvoice.success).toBe(false);
  });

  it("includes a full select-friendly currency list with common options first", () => {
    expect(supportedCurrencyCodes[0]).toBe("INR");
    expect(supportedCurrencyCodes).toContain("USD");
    expect(supportedCurrencyCodes).toContain("EUR");
  });
});
