import { describe, expect, it } from "vitest";

import { chatTitle } from "@/lib/chat/title";

describe("chatTitle", () => {
  it("keeps short text", () => {
    expect(chatTitle("Hello there")).toBe("Hello there");
  });

  it("collapses whitespace", () => {
    expect(chatTitle("  Hello\n\n  there  ")).toBe("Hello there");
  });

  it("truncates long text", () => {
    expect(chatTitle("a".repeat(60))).toBe(`${"a".repeat(50)}...`);
  });

  it("falls back for empty text", () => {
    expect(chatTitle("   ")).toBe("New chat");
  });
});
