"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";

import type { Message } from "@/lib/ai/types";
import {
  clearGuestChat,
  loadGuestChat,
  saveGuestChat,
  subscribeGuestChat,
} from "@/lib/chat/guest-chat-storage";

type GuestChatContextType = {
  hasMessages: boolean;
  setMessages: (messages: Message[]) => void;
  clearGuestChat: () => void;
} & (
  { messages: Message[]; isLoaded: true } | { messages: null; isLoaded: false }
);

const GuestChatContext = createContext<GuestChatContextType | undefined>(
  undefined,
);

const getServerSnapshot = () => null;

export function GuestChatProvider({ children }: { children: React.ReactNode }) {
  const messages = useSyncExternalStore(
    subscribeGuestChat,
    loadGuestChat,
    getServerSnapshot,
  );
  const base = {
    hasMessages: Boolean(messages?.length),
    setMessages: saveGuestChat,
    clearGuestChat,
  };
  const value: GuestChatContextType = messages
    ? { ...base, messages, isLoaded: true }
    : { ...base, messages: null, isLoaded: false };

  return (
    <GuestChatContext.Provider value={value}>
      {children}
    </GuestChatContext.Provider>
  );
}

export function useGuestChat() {
  const context = useContext(GuestChatContext);

  if (!context)
    throw new Error("useGuestChat must be used within a GuestChatProvider");

  return context;
}
