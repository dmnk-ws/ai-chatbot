import { afterEach, describe, expect, it, vi } from "vitest";

import { MistralProvider } from "@/lib/ai/providers/mistral";
import { mockSse, readText } from "@/test/msw";

describe("MistralProvider", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sends a chat completions request", async () => {
    vi.stubEnv("MISTRAL_API_KEY", "test-key");
    const calls = mockSse("https://api.mistral.ai/v1/chat/completions", [
      { choices: [{ delta: { content: "pong" } }] },
      "data: [DONE]",
    ]);
    const messages = [{ role: "user" as const, content: "ping" }];

    const stream = await new MistralProvider().chat(
      "mistral-small-latest",
      messages,
      true,
    );

    expect(await readText(stream)).toBe("pong");
    expect(calls[0].body).toEqual({
      model: "mistral-small-latest",
      messages,
      stream: true,
    });
    expect(calls[0].headers.get("authorization")).toBe("Bearer test-key");
  });
});
