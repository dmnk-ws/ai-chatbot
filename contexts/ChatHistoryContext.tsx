"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import type { ChatSummary } from "@/lib/db/models/Chat";

interface ChatHistoryContextType {
  chats: ChatSummary[];
  addChat: (chat: ChatSummary) => void;
  touchChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  removeChat: (id: string) => void;
  newChatKey: number;
  startNewChat: () => void;
  isCurrentNewChat: (key: number) => boolean;
  createdChatId: string | null;
  setCreatedChatId: (id: string) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(
  undefined,
);

export function ChatHistoryProvider({
  initialChats,
  children,
}: {
  initialChats: ChatSummary[];
  children: React.ReactNode;
}) {
  const [chats, setChats] = useState(initialChats);
  const [newChatKey, setNewChatKey] = useState(0);
  const newChatKeyRef = useRef(0);
  const [createdChatId, setCreatedChatId] = useState<string | null>(null);

  const addChat = useCallback((chat: ChatSummary) => {
    setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)]);
  }, []);

  const touchChat = useCallback((id: string) => {
    setChats((prev) => {
      const chat = prev.find((c) => c.id === id);
      return chat ? [chat, ...prev.filter((c) => c.id !== id)] : prev;
    });
  }, []);

  const renameChat = useCallback((id: string, title: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, title } : chat)),
    );
  }, []);

  const removeChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
  }, []);

  const startNewChat = useCallback(() => {
    newChatKeyRef.current += 1;
    setNewChatKey(newChatKeyRef.current);
    setCreatedChatId(null);
  }, []);

  const isCurrentNewChat = useCallback(
    (key: number) => key === newChatKeyRef.current,
    [],
  );

  return (
    <ChatHistoryContext.Provider
      value={{
        chats,
        addChat,
        touchChat,
        renameChat,
        removeChat,
        newChatKey,
        startNewChat,
        isCurrentNewChat,
        createdChatId,
        setCreatedChatId,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);

  if (!context)
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");

  return context;
}
