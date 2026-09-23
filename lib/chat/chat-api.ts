import type { Message } from "@/lib/ai/types";
import type { ChatSummary } from "@/lib/db/models/Chat";

export async function importChatApi(messages: Message[]): Promise<ChatSummary> {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages.filter((m) => m.content) }),
  });

  if (!res.ok) throw new Error("Failed to import chat");

  return (await res.json()) as ChatSummary;
}

export async function renameChatApi(
  id: string,
  title: string,
): Promise<ChatSummary> {
  const res = await fetch(`/api/chats/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) throw new Error("Failed to rename chat");

  return (await res.json()) as ChatSummary;
}
