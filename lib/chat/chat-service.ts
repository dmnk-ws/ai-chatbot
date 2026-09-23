import { isValidObjectId } from "mongoose";

import type { Message } from "@/lib/ai/types";
import { chatTitle } from "@/lib/chat/title";
import Chat, { ChatSummary } from "@/lib/db/models/Chat";
import { dbConnect } from "@/lib/db/mongoose";

export class ChatNotFoundError extends Error {
  constructor(id: string) {
    super(`Chat ${id} not found`);
  }
}

export interface ChatDetail extends ChatSummary {
  messages: Message[];
}

export async function listChats(userId: string): Promise<ChatSummary[]> {
  await dbConnect();

  const chats = await Chat.find({ userId })
    .select("title")
    .sort({ updatedAt: -1 })
    .lean();

  return chats.map((chat) => ({ id: chat._id.toString(), title: chat.title }));
}

export async function getChat(
  userId: string,
  chatId: string,
): Promise<ChatDetail | null> {
  if (!isValidObjectId(chatId)) return null;
  await dbConnect();

  const chat = await Chat.findOne({ _id: chatId, userId }).lean();
  if (!chat) return null;

  return {
    id: chat._id.toString(),
    title: chat.title,
    messages: chat.messages.map(({ role, content }) => ({ role, content })),
  };
}

export async function createChat(
  userId: string,
  messages: Message[],
): Promise<ChatSummary> {
  await dbConnect();

  const firstUserMessage = messages.find((m) => m.role === "user");
  const chat = await Chat.create({
    userId,
    title: chatTitle(firstUserMessage?.content ?? ""),
    messages,
  });

  return { id: chat.id, title: chat.title };
}

export async function addUserMessage(
  userId: string,
  chatId: string | undefined,
  content: string,
): Promise<string> {
  if (!chatId) {
    const chat = await createChat(userId, [{ role: "user", content }]);
    return chat.id;
  }

  if (!isValidObjectId(chatId)) throw new ChatNotFoundError(chatId);
  await dbConnect();

  const chat = await Chat.findOne(
    { _id: chatId, userId },
    { messages: { $slice: -1 } },
  ).lean();
  if (!chat) throw new ChatNotFoundError(chatId);

  const lastMessage = chat.messages.at(-1);
  if (lastMessage?.role === "user" && lastMessage.content === content) {
    return chatId;
  }

  await Chat.updateOne(
    { _id: chatId },
    { $push: { messages: { role: "user", content } } },
  );

  return chatId;
}

export async function addAssistantMessage(
  chatId: string,
  content: string,
): Promise<void> {
  await dbConnect();

  await Chat.updateOne(
    { _id: chatId },
    { $push: { messages: { role: "assistant", content } } },
  );
}

export async function renameChat(
  userId: string,
  chatId: string,
  title: string,
): Promise<void> {
  if (!isValidObjectId(chatId)) throw new ChatNotFoundError(chatId);
  await dbConnect();

  const { matchedCount } = await Chat.updateOne(
    { _id: chatId, userId },
    { title },
    { timestamps: false },
  );
  if (matchedCount === 0) throw new ChatNotFoundError(chatId);
}
