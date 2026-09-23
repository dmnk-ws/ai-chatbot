import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Message } from "@/lib/ai/types";
import { ChatNotFoundError, addUserMessage } from "@/lib/chat/chat-service";
import Chat from "@/lib/db/models/Chat";

vi.mock("@/lib/db/mongoose", () => ({ dbConnect: vi.fn() }));
vi.mock("@/lib/db/models/Chat", () => ({
  default: { findOne: vi.fn(), updateOne: vi.fn(), create: vi.fn() },
}));

const CHAT_ID = "507f1f77bcf86cd799439011";

function storedChat(messages: Message[] | null) {
  vi.mocked(Chat.findOne).mockReturnValue({
    lean: async () => (messages ? { messages } : null),
  } as never);
}

describe("addUserMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appends to a chat whose last message was answered", async () => {
    storedChat([{ role: "assistant", content: "pong" }]);

    await addUserMessage("user-1", CHAT_ID, "ping");

    expect(Chat.findOne).toHaveBeenCalledWith(
      { _id: CHAT_ID, userId: "user-1" },
      { messages: { $slice: -1 } },
    );
    expect(Chat.updateOne).toHaveBeenCalledWith(
      { _id: CHAT_ID },
      { $push: { messages: { role: "user", content: "ping" } } },
    );
  });

  it("does not store an unanswered message twice", async () => {
    storedChat([{ role: "user", content: "ping" }]);

    const id = await addUserMessage("user-1", CHAT_ID, "ping");

    expect(id).toBe(CHAT_ID);
    expect(Chat.updateOne).not.toHaveBeenCalled();
  });

  it("stores a different message after an unanswered one", async () => {
    storedChat([{ role: "user", content: "ping" }]);

    await addUserMessage("user-1", CHAT_ID, "again");

    expect(Chat.updateOne).toHaveBeenCalledWith(
      { _id: CHAT_ID },
      { $push: { messages: { role: "user", content: "again" } } },
    );
  });

  it("rejects a chat the user does not own", async () => {
    storedChat(null);

    await expect(addUserMessage("user-2", CHAT_ID, "ping")).rejects.toThrow(
      ChatNotFoundError,
    );
    expect(Chat.updateOne).not.toHaveBeenCalled();
  });
});
