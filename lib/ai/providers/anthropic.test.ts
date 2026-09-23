import { afterEach, describe, expect, it, vi } from "vitest";

import { AnthropicProvider } from "@/lib/ai/providers/anthropic";
import { mockSse, readText } from "@/test/msw";

const events = [
  "event: message_start",
  { type: "message_start", message: { id: "msg_1", content: [] } },
  "event: content_block_start",
  {
    type: "content_block_start",
    index: 0,
    content_block: { type: "text", text: "" },
  },
  "event: ping",
  { type: "ping" },
  "event: content_block_delta",
  {
    type: "content_block_delta",
    index: 0,
    delta: { type: "text_delta", text: "Hello" },
  },
  "event: content_block_delta",
  {
    type: "content_block_delta",
    index: 0,
    delta: { type: "text_delta", text: " world" },
  },
  "event: content_block_stop",
  { type: "content_block_stop", index: 0 },
  "event: message_delta",
  { type: "message_delta", delta: { stop_reason: "end_turn" } },
  "event: message_stop",
  { type: "message_stop" },
];

describe("AnthropicProvider", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sends a messages request and parses text deltas", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const calls = mockSse("https://api.anthropic.com/v1/messages", events);
    const messages = [{ role: "user" as const, content: "ping" }];

    const stream = await new AnthropicProvider().chat(
      "claude-sonnet-4-5",
      messages,
      true,
    );

    expect(await readText(stream)).toBe("Hello world");
    expect(calls[0].body).toEqual({
      model: "claude-sonnet-4-5",
      messages,
      stream: true,
      max_tokens: 1000,
    });
    expect(calls[0].headers.get("x-api-key")).toBe("test-key");
    expect(calls[0].headers.get("anthropic-version")).toBe("2023-06-01");
  });
});
