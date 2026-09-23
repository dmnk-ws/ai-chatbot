import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OpenAIProvider } from "@/lib/ai/providers/openai";
import { mockError, mockSse, readText, server } from "@/test/msw";

const URL = "https://api.openai.com/v1/chat/completions";
const messages = [{ role: "user" as const, content: "Hi" }];

const delta = (content?: string) => ({ choices: [{ delta: { content } }] });

describe("BaseProvider", () => {
  beforeEach(() => vi.stubEnv("OPENAI_API_KEY", "test-key"));
  afterEach(() => vi.unstubAllEnvs());

  it("parses content deltas and ignores everything else", async () => {
    mockSse(URL, [
      ": keep-alive",
      delta("Hel"),
      delta(),
      "",
      delta("lo"),
      "data: [DONE]",
    ]);

    const stream = await new OpenAIProvider().chat("gpt-4.1", messages, true);

    expect(await readText(stream)).toBe("Hello");
  });

  it("handles events split across chunks", async () => {
    mockSse(URL, [delta("Hello "), delta("world"), "data: [DONE]"], {
      chunkSize: 7,
    });

    const stream = await new OpenAIProvider().chat("gpt-4.1", messages, true);

    expect(await readText(stream)).toBe("Hello world");
  });

  it("throws with status and body on error responses", async () => {
    mockError(URL, 401, { error: { message: "Invalid API key" } });

    await expect(
      new OpenAIProvider().chat("gpt-4.1", messages, true),
    ).rejects.toThrow(
      'OpenAIProvider 401: {"error":{"message":"Invalid API key"}}',
    );
  });

  it("propagates network errors", async () => {
    server.use(http.post(URL, () => HttpResponse.error()));

    await expect(
      new OpenAIProvider().chat("gpt-4.1", messages, true),
    ).rejects.toThrow();
  });
});
