import { afterEach, describe, expect, it, vi } from "vitest";

import { OpenAIProvider } from "@/lib/ai/providers/openai";
import { mockSse, readText } from "@/test/msw";

describe("OpenAIProvider", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sends a chat completions request", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const calls = mockSse("https://api.openai.com/v1/chat/completions", [
      { choices: [{ delta: { content: "pong" } }] },
      "data: [DONE]",
    ]);
    const messages = [{ role: "user" as const, content: "ping" }];

    const stream = await new OpenAIProvider().chat("gpt-4.1", messages, true);

    expect(await readText(stream)).toBe("pong");
    expect(calls[0].body).toEqual({ model: "gpt-4.1", messages, stream: true });
    expect(calls[0].headers.get("authorization")).toBe("Bearer test-key");
  });
});
