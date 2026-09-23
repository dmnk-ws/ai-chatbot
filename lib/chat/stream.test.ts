import { beforeEach, describe, expect, it, vi } from "vitest";

import { observeStream } from "@/lib/chat/stream";
import { readText } from "@/test/msw";

const encoder = new TextEncoder();

function textStream(chunks: string[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    pull(controller) {
      const chunk = chunks.shift();
      if (chunk === undefined) controller.close();
      else controller.enqueue(encoder.encode(chunk));
    },
  });
}

function failingStream(firstChunk: string): ReadableStream<Uint8Array> {
  let sent = false;
  return new ReadableStream({
    pull(controller) {
      if (sent) controller.error(new Error("provider broke"));
      else controller.enqueue(encoder.encode(firstChunk));
      sent = true;
    },
  });
}

function handlers() {
  return {
    onComplete: vi.fn(async () => {}),
    onCancel: vi.fn(async () => {}),
  };
}

describe("observeStream", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("passes the stream through and reports the full text", async () => {
    const h = handlers();

    const text = await readText(observeStream(textStream(["po", "ng"]), h));

    expect(text).toBe("pong");
    expect(h.onComplete).toHaveBeenCalledExactlyOnceWith("pong");
    expect(h.onCancel).not.toHaveBeenCalled();
  });

  it("errors the stream without completing when the source fails", async () => {
    const h = handlers();

    await expect(
      readText(observeStream(failingStream("po"), h)),
    ).rejects.toThrow("provider broke");

    expect(h.onComplete).not.toHaveBeenCalled();
    expect(h.onCancel).not.toHaveBeenCalled();
  });

  it("reports the partial text when the reader cancels", async () => {
    const h = handlers();
    const reader = observeStream(textStream(["po", "ng"]), h).getReader();

    await reader.read();
    await reader.cancel();

    expect(h.onCancel).toHaveBeenCalledExactlyOnceWith("po");
    expect(h.onComplete).not.toHaveBeenCalled();
  });

  it("still delivers the full text when a handler fails", async () => {
    const h = handlers();
    const failure = new Error("db down");
    h.onComplete.mockRejectedValue(failure);

    const text = await readText(observeStream(textStream(["po", "ng"]), h));

    expect(text).toBe("pong");
    expect(console.error).toHaveBeenCalledWith(failure);
  });
});
