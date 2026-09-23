import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/chats/route";
import { getSession } from "@/lib/auth/jwt";
import { createChat } from "@/lib/chat/chat-service";

vi.mock("@/lib/auth/jwt", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/chat/chat-service", () => ({ createChat: vi.fn() }));

const MESSAGES = [
  { role: "user", content: "ping" },
  { role: "assistant", content: "pong" },
];

function importRequest(body: object) {
  return new NextRequest("http://localhost/api/chats", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      id: "user-1",
      email: "jane@acme.com",
      firstName: "Jane",
      lastName: "Smith",
    });
    vi.mocked(createChat).mockResolvedValue({ id: "chat-1", title: "ping" });
  });

  it("creates a chat from the given messages", async () => {
    const response = await POST(importRequest({ messages: MESSAGES }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: "chat-1", title: "ping" });
    expect(createChat).toHaveBeenCalledWith("user-1", MESSAGES);
  });

  it("returns 401 without a session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const response = await POST(importRequest({ messages: MESSAGES }));

    expect(response.status).toBe(401);
    expect(createChat).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", {}],
    ["empty", { messages: [] }],
    ["bad role", { messages: [{ role: "system", content: "x" }] }],
    ["bad content", { messages: [{ role: "user", content: 1 }] }],
    ["blank content", { messages: [{ role: "user", content: "" }] }],
  ])("returns 400 for %s messages", async (_, body) => {
    const response = await POST(importRequest(body));

    expect(response.status).toBe(400);
    expect(createChat).not.toHaveBeenCalled();
  });
});
