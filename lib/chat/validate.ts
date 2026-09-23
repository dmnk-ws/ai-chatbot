import type { Message } from "@/lib/ai/types";

export function isMessageList(value: unknown): value is Message[] {
  return (
    Array.isArray(value) &&
    value.every(
      (m) =>
        m !== null &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
  );
}
