import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/chat/route";
import { getSession } from "@/lib/auth/jwt";
import {
  ChatNotFoundError,
  addAssistantMessage,
  addUserMessage,
} from "@/lib/chat/chat-service";
import { mockError, mockSse, server } from "@/test/msw";

vi.mock("@/lib/auth/jwt", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/chat/chat-service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/chat/chat-service")>()),
  addUserMessage: vi.fn(),
  addAssistantMessage: vi.fn(),
}));

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const USER = {
  id: "user-1",
  email: "jane@acme.com",
  firstName: "Jane",
  lastName: "Smith",
};

function chatRequest(provider: string, extra: object = {}) {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify({
      provider,
      model: "mistral-small-latest",
      messages: [{ role: "user", content: "ping" }],
      ...extra,
    }),
  });
}

function mockBrokenStream() {
  server.use(
    http.post(MISTRAL_URL, () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ choices: [{ delta: { content: "po" } }] })}\n\n`,
            ),
          );
          setTimeout(() => controller.error(new Error("connection lost")), 5);
        },
      });
      return new HttpResponse(stream, {
        headers: { "Content-Type": "text/event-stream" },
      });
    }),
  );
}

function mockPong() {
  mockSse(MISTRAL_URL, [
    { choices: [{ delta: { content: "po" } }] },
    { choices: [{ delta: { content: "ng" } }] },
    "data: [DONE]",
  ]);
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getSession).mockResolvedValue(USER);
    vi.mocked(addUserMessage).mockResolvedValue("chat-1");
  });

  it("streams the provider's text", async () => {
    mockPong();

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

  describe("logged in", () => {
    it("creates a chat and persists both messages", async () => {
      mockPong();

      const response = await POST(chatRequest("Mistral"));
      await response.text();

      expect(response.headers.get("X-Chat-Id")).toBe("chat-1");
      expect(addUserMessage).toHaveBeenCalledWith("user-1", undefined, "ping");
      expect(addAssistantMessage).toHaveBeenCalledWith("chat-1", "pong");
    });

    it("appends to an existing chat", async () => {
      mockPong();

      const response = await POST(chatRequest("Mistral", { chatId: "chat-1" }));
      await response.text();

      expect(addUserMessage).toHaveBeenCalledWith("user-1", "chat-1", "ping");
      expect(addAssistantMessage).toHaveBeenCalledWith("chat-1", "pong");
    });

    it("returns the created chat id when the provider fails", async () => {
      mockError(MISTRAL_URL, 429, { message: "Rate limit exceeded" });

      const response = await POST(chatRequest("Mistral"));

      expect(response.status).toBe(500);
      expect(response.headers.get("X-Chat-Id")).toBe("chat-1");
    });

    it("keeps the user message when the provider fails", async () => {
      mockError(MISTRAL_URL, 429, { message: "Rate limit exceeded" });

      await POST(chatRequest("Mistral"));

      expect(addUserMessage).toHaveBeenCalledWith("user-1", undefined, "ping");
      expect(addAssistantMessage).not.toHaveBeenCalled();
    });

    it("stores no reply when the reply breaks off", async () => {
      mockBrokenStream();

      const response = await POST(chatRequest("Mistral"));

      await expect(response.text()).rejects.toThrow();
      expect(addAssistantMessage).not.toHaveBeenCalled();
    });

    it("sends consecutive user messages to the provider as one turn", async () => {
      const calls = mockSse(MISTRAL_URL, ["data: [DONE]"]);

      const response = await POST(
        chatRequest("Mistral", {
          chatId: "chat-1",
          messages: [
            { role: "user", content: "ping" },
            { role: "user", content: "again" },
          ],
        }),
      );
      await response.text();

      expect(calls[0].body).toMatchObject({
        messages: [{ role: "user", content: "ping\n\nagain" }],
      });
      expect(addUserMessage).toHaveBeenCalledWith("user-1", "chat-1", "again");
    });

    it("returns 404 for a chat the user does not own", async () => {
      vi.mocked(addUserMessage).mockRejectedValue(
        new ChatNotFoundError("other"),
      );

      const response = await POST(chatRequest("Mistral", { chatId: "other" }));

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Chat not found" });
    });

    it("returns 400 when the last message is not from the user", async () => {
      const response = await POST(
        chatRequest("Mistral", {
          messages: [{ role: "assistant", content: "hi" }],
        }),
      );

      expect(response.status).toBe(400);
      expect(addUserMessage).not.toHaveBeenCalled();
    });
  });

  describe("guest", () => {
    beforeEach(() => {
      vi.mocked(getSession).mockResolvedValue(null);
    });

    it("streams without persisting anything", async () => {
      mockPong();

      const response = await POST(chatRequest("Mistral"));

      expect(await response.text()).toBe("pong");
      expect(response.headers.get("X-Chat-Id")).toBeNull();
      expect(addUserMessage).not.toHaveBeenCalled();
      expect(addAssistantMessage).not.toHaveBeenCalled();
    });

    it("does not touch the database when the provider fails", async () => {
      mockError(MISTRAL_URL, 429, { message: "Rate limit exceeded" });

      const response = await POST(chatRequest("Mistral"));

      expect(response.status).toBe(500);
      expect(addUserMessage).not.toHaveBeenCalled();
    });

    it("returns 401 when addressing a saved chat", async () => {
      const response = await POST(chatRequest("Mistral", { chatId: "chat-1" }));

      expect(response.status).toBe(401);
    });
  });
});
