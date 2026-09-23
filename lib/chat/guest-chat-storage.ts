import type { Message } from "@/lib/ai/types";
import { isMessageList } from "@/lib/chat/validate";

const STORAGE_KEY = "guestChat";

let cache: Message[] | undefined;
const listeners = new Set<() => void>();

function readStorage(): Message[] {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    return isMessageList(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function loadGuestChat(): Message[] {
  cache ??= readStorage();
  return cache;
}

export function subscribeGuestChat(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function saveGuestChat(messages: Message[]): void {
  cache = messages;
  try {
    if (messages.length === 0) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // storage unavailable (private mode, blocked)
    // guest chat stays in memory
  }
  listeners.forEach((listener) => listener());
}

export function clearGuestChat(): void {
  saveGuestChat([]);
}
