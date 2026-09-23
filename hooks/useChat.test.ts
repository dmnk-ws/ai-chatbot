import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ChangeEvent, SubmitEvent } from "react";
import { describe, expect, it } from "vitest";

import { useChat } from "@/hooks/useChat";
import { server } from "@/test/msw";

const submitEvent = { preventDefault() {} } as SubmitEvent;

async function send(text: string) {
  const hook = renderHook(() =>
    useChat({ provider: "Mistral", model: "mistral-small-latest" }),
  );

  act(() =>
    hook.result.current.handleChange({
      target: { value: text },
    } as ChangeEvent<HTMLTextAreaElement>),
  );
  await act(() => hook.result.current.handleSubmit(submitEvent));

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

  it("shows an error message when the request fails", async () => {
    server.use(
      http.post("*/api/chat", () =>
        HttpResponse.json({ error: "Failed to stream chat" }, { status: 500 }),
      ),
    );

    const result = await send("ping");

    expect(result.current.messages[1]).toEqual({
      role: "assistant",
      content: "Error: Failed to get response",
    });
    expect(result.current.isLoading).toBe(false);
  });
});
