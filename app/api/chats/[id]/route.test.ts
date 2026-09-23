import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PATCH } from "@/app/api/chats/[id]/route";
import { getSession } from "@/lib/auth/jwt";
import { ChatNotFoundError, renameChat } from "@/lib/chat/chat-service";

vi.mock("@/lib/auth/jwt", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/chat/chat-service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/chat/chat-service")>()),
  renameChat: vi.fn(),
}));

function renameRequest(body: object) {
  return new NextRequest("http://localhost/api/chats/chat-1", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

const context = { params: Promise.resolve({ id: "chat-1" }) };

describe("PATCH /api/chats/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      id: "user-1",
      email: "jane@acme.com",
      firstName: "Jane",
      lastName: "Smith",
    });
  });

  it("renames the chat with a normalized title", async () => {
    const response = await PATCH(
      renameRequest({ title: "  Trip   ideas " }),
      context,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: "chat-1",
      title: "Trip ideas",
    });
    expect(renameChat).toHaveBeenCalledWith("user-1", "chat-1", "Trip ideas");
  });

  it("returns 401 without a session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const response = await PATCH(renameRequest({ title: "Trip" }), context);

    expect(response.status).toBe(401);
    expect(renameChat).not.toHaveBeenCalled();
  });

  it("returns 404 for a chat the user does not own", async () => {
    vi.mocked(renameChat).mockRejectedValue(new ChatNotFoundError("chat-1"));

    const response = await PATCH(renameRequest({ title: "Trip" }), context);

    expect(response.status).toBe(404);
  });

  it.each([
    ["empty", { title: "   " }],
    ["missing", {}],
    ["not a string", { title: 1 }],
  ])("returns 400 for a %s title", async (_, body) => {
    const response = await PATCH(renameRequest(body), context);

    expect(response.status).toBe(400);
    expect(renameChat).not.toHaveBeenCalled();
  });
});
