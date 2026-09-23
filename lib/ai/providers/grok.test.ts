import { afterEach, describe, expect, it, vi } from "vitest";

import { GrokProvider } from "@/lib/ai/providers/grok";
import { mockSse, readText } from "@/test/msw";

const events = [
  "event: response.created",
  { type: "response.created", response: { id: "resp_1" } },
  "event: response.output_text.delta",
  { type: "response.output_text.delta", delta: "Hello" },
  "event: response.output_text.delta",
  { type: "response.output_text.delta", delta: " world" },
  "event: response.completed",
  { type: "response.completed", response: { id: "resp_1" } },
];

describe("GrokProvider", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sends a responses request and parses text deltas", async () => {
    vi.stubEnv("XAI_API_KEY", "test-key");
    const calls = mockSse("https://api.x.ai/v1/responses", events);
    const messages = [{ role: "user" as const, content: "ping" }];

    const stream = await new GrokProvider().chat(
      "grok-4-1-fast",
      messages,
      true,
    );

    expect(await readText(stream)).toBe("Hello world");
    expect(calls[0].body).toEqual({
      model: "grok-4-1-fast",
      input: messages,
      stream: true,
      store: false,
    });
    expect(calls[0].headers.get("authorization")).toBe("Bearer test-key");
  });
});
