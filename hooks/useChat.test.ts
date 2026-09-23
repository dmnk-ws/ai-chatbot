import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ChangeEvent, SubmitEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { useChat } from "@/hooks/useChat";
import { server } from "@/test/msw";

const submitEvent = { preventDefault() {} } as SubmitEvent;

async function type(
  result: { current: ReturnType<typeof useChat> },
  text: string,
) {
  act(() =>
    result.current.handleChange({
      target: { value: text },
    } as ChangeEvent<HTMLTextAreaElement>),
  );
  await act(() => result.current.handleSubmit(submitEvent));
}

async function send(
  text: string,
  callbacks: Pick<
    Parameters<typeof useChat>[0],
    "onChatCreated" | "onReplyReceived"
  > = {},
) {
  const hook = renderHook(() =>
    useChat({
      provider: "Mistral",
      model: "mistral-small-latest",
      ...callbacks,
    }),
  );

  await type(hook.result, text);

  return hook.result;
}

describe("useChat", () => {
  it("streams the assistant reply into the messages", async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post("*/api/chat", async ({ request }) => {
        bodies.push(await request.json());
        return new HttpResponse("pong");
      }),
    );

    const result = await send("ping");

    expect(result.current.messages).toEqual([
      { role: "user", content: "ping" },
      { role: "assistant", content: "pong" },
    ]);
    expect(result.current.isLoading).toBe(false);
    expect(bodies[0]).toEqual({
      provider: "Mistral",
      model: "mistral-small-latest",
      messages: [{ role: "user", content: "ping" }],
    });
  });

  it("keeps the unanswered message when the request fails", async () => {
    server.use(
      http.post("*/api/chat", () =>
        HttpResponse.json({ error: "Failed to stream chat" }, { status: 500 }),
      ),
    );

    const result = await send("ping");

    expect(result.current.messages).toEqual([
      { role: "user", content: "ping" },
    ]);
    expect(result.current.canRetry).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("reports a created chat even when the request fails", async () => {
    server.use(
      http.post("*/api/chat", () =>
        HttpResponse.json(
          { error: "Failed to stream chat" },
          { status: 500, headers: { "X-Chat-Id": "chat-1" } },
        ),
      ),
    );
    const onChatCreated = vi.fn();

    await send("ping", { onChatCreated });

    expect(onChatCreated).toHaveBeenCalledWith("chat-1", "ping");
  });

  it("reports the messages once the reply is complete", async () => {
    server.use(http.post("*/api/chat", () => new HttpResponse("pong")));
    const onReplyReceived = vi.fn();

    await send("ping", { onReplyReceived });

    expect(onReplyReceived).toHaveBeenCalledOnce();
    expect(onReplyReceived).toHaveBeenCalledWith([
      { role: "user", content: "ping" },
      { role: "assistant", content: "pong" },
    ]);
  });

  it("does not report the messages when the reply fails", async () => {
    server.use(
      http.post("*/api/chat", () =>
        HttpResponse.json({ error: "Failed to stream chat" }, { status: 500 }),
      ),
    );
    const onReplyReceived = vi.fn();

    await send("ping", { onReplyReceived });

    expect(onReplyReceived).not.toHaveBeenCalled();
  });

  it("drops the partial reply when the stream breaks", async () => {
    server.use(
      http.post("*/api/chat", () => {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode("po"));
            controller.error(new Error("connection lost"));
          },
        });
        return new HttpResponse(stream);
      }),
    );

    const result = await send("ping");

    expect(result.current.messages).toEqual([
      { role: "user", content: "ping" },
    ]);
    expect(result.current.canRetry).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  describe("after a failed reply", () => {
    function failOnce() {
      const bodies: { messages: unknown }[] = [];
      let fail = true;
      server.use(
        http.post("*/api/chat", async ({ request }) => {
          bodies.push((await request.json()) as { messages: unknown });
          if (fail) {
            fail = false;
            return HttpResponse.json({ error: "Failed" }, { status: 500 });
          }
          return new HttpResponse("pong");
        }),
      );
      return bodies;
    }

    it("retries without adding the message again", async () => {
      const bodies = failOnce();

      const result = await send("ping");
      await act(() => result.current.retry());

      expect(bodies[1].messages).toEqual([{ role: "user", content: "ping" }]);
      expect(result.current.messages).toEqual([
        { role: "user", content: "ping" },
        { role: "assistant", content: "pong" },
      ]);
      expect(result.current.canRetry).toBe(false);
    });

    it("sends the unanswered message along with a new one", async () => {
      const bodies = failOnce();

      const result = await send("ping");
      await type(result, "again");

      expect(bodies[1].messages).toEqual([
        { role: "user", content: "ping" },
        { role: "user", content: "again" },
      ]);
    });
  });
});
