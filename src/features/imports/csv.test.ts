import { describe, expect, it } from "vitest";
import { coerceCsvContactRow, parseCsvText } from "@/features/imports/csv";

describe("parseCsvText", () => {
  it("parses quoted csv values", () => {
    const parsed = parseCsvText('Name,Email,Tags\n"Rahul Verma",rahul@example.com,"Warm lead;Agency"');

    expect(parsed.headers).toEqual(["Name", "Email", "Tags"]);
    expect(parsed.rows[0]).toEqual(["Rahul Verma", "rahul@example.com", "Warm lead;Agency"]);
  });

  it("maps common headers into contact fields", () => {
    const headers = ["Full Name", "Email Address", "Company", "Tags"];
    const row = ["Neha Sharma", "neha@example.com", "ABC Studio", "Design;Warm"];
    const contact = coerceCsvContactRow(headers, row);

    expect(contact.name).toBe("Neha Sharma");
    expect(contact.email).toBe("neha@example.com");
    expect(contact.companyName).toBe("ABC Studio");
    expect(contact.tagsText).toBe("Design, Warm");
  });
});
