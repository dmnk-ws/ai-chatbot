import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/chat/route";
import { mockError, mockSse } from "@/test/msw";

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

function chatRequest(provider: string) {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify({
      provider,
      model: "mistral-small-latest",
      messages: [{ role: "user", content: "ping" }],
    }),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("streams the provider's text", async () => {
    mockSse(MISTRAL_URL, [
      { choices: [{ delta: { content: "po" } }] },
      { choices: [{ delta: { content: "ng" } }] },
      "data: [DONE]",
    ]);

    const response = await POST(chatRequest("Mistral"));

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("pong");
  });

  it("returns 400 for an unknown provider", async () => {
    const response = await POST(chatRequest("Nope"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Provider Nope not found",
    });
  });

  it("returns 500 when the provider fails", async () => {
    mockError(MISTRAL_URL, 429, { message: "Rate limit exceeded" });

    const response = await POST(chatRequest("Mistral"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to stream chat" });
  });
});
