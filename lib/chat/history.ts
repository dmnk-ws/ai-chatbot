import type { Message } from "@/lib/ai/types";

export function mergeConsecutiveUserMessages(messages: Message[]): Message[] {
  return messages.reduce<Message[]>((merged, message) => {
    const previous = merged.at(-1);
    if (previous?.role === "user" && message.role === "user") {
      return [
        ...merged.slice(0, -1),
        { role: "user", content: `${previous.content}\n\n${message.content}` },
      ];
    }
    return [...merged, message];
  }, []);
}
