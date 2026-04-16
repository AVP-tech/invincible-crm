import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCompletion: vi.fn(),
  contactFindFirst: vi.fn(),
  dealFindFirst: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  google: vi.fn(),
  generateObject: vi.fn()
}));

vi.mock("openai", () => ({
  default: class OpenAI {
    chat = {
      completions: {
        create: mocks.createCompletion
      }
    };
  }
}));

vi.mock("@/lib/db", () => ({
  db: {
    contact: {
      findFirst: mocks.contactFindFirst
    },
    deal: {
      findFirst: mocks.dealFindFirst
    }
  }
}));

vi.mock("@/lib/env", () => ({
  env: {
    openAiApiKey: "sk-test",
    openAiModel: "gpt-4o-mini",
    googleAiApiKey: "",
    googleModel: "gemini-2.0-flash"
  }
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: mocks.warn,
    error: mocks.error,
    info: mocks.info
  }
}));

vi.mock("@ai-sdk/google", () => ({
  google: mocks.google
}));

vi.mock("ai", () => ({
  generateObject: mocks.generateObject
}));

import { parseCaptureResult } from "@/features/capture/parser";

describe("parseCaptureResult OpenAI parsing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.contactFindFirst.mockResolvedValue(null);
    mocks.dealFindFirst.mockResolvedValue(null);
  });

  it("defaults parserMode to AI when OpenAI omits it", async () => {
    mocks.createCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              actionType: "create",
              summary: "Create a follow-up for Rahul",
              confidence: 0.91,
              contact: {
                name: "Rahul"
              }
            })
          }
        }
      ]
    });

    const result = await parseCaptureResult(
      "user-1",
      "Call Rahul tomorrow about the proposal",
      new Date("2026-04-01T09:00:00.000Z")
    );

    expect(result.status).toBe("ready");
    expect(result.provider).toBe("OpenAI");
    expect(result.preview.parserMode).toBe("AI");
    expect(result.preview.contact?.name).toBe("Rahul");
    expect(mocks.warn).not.toHaveBeenCalledWith(
      "OpenAI capture parse returned invalid JSON for the schema.",
      expect.anything()
    );
  });

  it("accepts OpenAI payloads that use null for optional fields", async () => {
    mocks.createCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              actionType: "mixed",
              parserMode: "AI",
              summary: "Called Priya, she's interested and needs a proposal by Friday.",
              confidence: 0.9,
              missingFields: [],
              suggestedUpdates: [],
              existingContactId: null,
              existingDealId: null,
              contact: {
                name: "Priya",
                email: null,
                phone: null,
                companyName: null,
                source: null,
                tags: []
              },
              deal: {
                title: null,
                description: null,
                stage: "NEW_LEAD",
                amount: null,
                currency: "USD",
                expectedCloseDate: "2026-04-21T00:00:00.000Z",
                nextStep: "Send proposal"
              },
              task: null,
              note: null
            })
          }
        }
      ]
    });

    const result = await parseCaptureResult(
      "user-1",
      "Called Priya, she's interested and needs a proposal by Friday.",
      new Date("2026-04-16T09:00:00.000Z")
    );

    expect(result.status).toBe("ready");
    expect(result.provider).toBe("OpenAI");
    expect(result.preview.parserMode).toBe("AI");
    expect(result.preview.contact?.name).toBe("Priya");
    expect(result.preview.contact?.email).toBeUndefined();
    expect(result.preview.existingContactId).toBeUndefined();
    expect(result.preview.deal?.nextStep).toBe("Send proposal");
    expect(result.preview.task?.title).toBeTruthy();
    expect(mocks.warn).not.toHaveBeenCalledWith(
      "OpenAI capture parse returned invalid JSON for the schema.",
      expect.anything()
    );
  });

  it("logs schema issues when OpenAI returns an invalid capture payload", async () => {
    mocks.createCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              actionType: "create",
              parserMode: "AUTOMATIC",
              summary: "Create a follow-up for Rahul",
              confidence: 0.91
            })
          }
        }
      ]
    });

    const result = await parseCaptureResult(
      "user-1",
      "Call Rahul tomorrow about the proposal",
      new Date("2026-04-01T09:00:00.000Z")
    );

    expect(result.status).toBe("fallback");
    expect(result.preview.parserMode).toBe("FALLBACK");
    expect(mocks.warn).toHaveBeenCalledWith(
      "OpenAI capture parse returned invalid JSON for the schema.",
      expect.objectContaining({
        feature: "quick_capture",
        provider: "openai",
        rawPreview: expect.stringContaining("\"AUTOMATIC\""),
        schemaIssues: expect.arrayContaining([expect.objectContaining({ path: "parserMode" })])
      })
    );
  });
});
