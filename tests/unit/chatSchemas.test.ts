import { describe, expect, it } from "vitest";
import { chatRequestSchema, createConversationRequestSchema } from "@/lib/validation/chatSchemas";

describe("chatRequestSchema", () => {
  it("accepts a valid request", () => {
    const result = chatRequestSchema.safeParse({ conversationId: "conv_1", message: "Hello" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing conversationId", () => {
    const result = chatRequestSchema.safeParse({ message: "Hello" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty message", () => {
    const result = chatRequestSchema.safeParse({ conversationId: "conv_1", message: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a message over the length limit", () => {
    const result = chatRequestSchema.safeParse({
      conversationId: "conv_1",
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-string message", () => {
    const result = chatRequestSchema.safeParse({ conversationId: "conv_1", message: 12345 });
    expect(result.success).toBe(false);
  });
});

describe("createConversationRequestSchema", () => {
  it("accepts a valid request", () => {
    const result = createConversationRequestSchema.safeParse({ customerId: "cust_1" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing customerId", () => {
    const result = createConversationRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
