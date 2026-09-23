"use client";

import { usePathname } from "next/navigation";
import React from "react";

import ChatHistoryItem from "@/components/sidebar/chat-history-item";
import { useChatHistory } from "@/contexts/ChatHistoryContext";

interface ChatHistoryProps {
  onNavigate?: () => void;
}

function ChatHistory({ onNavigate }: ChatHistoryProps) {
  const pathname = usePathname();
  const { chats, createdChatId } = useChatHistory();

  return (
    <nav aria-label="Chats" className="flex flex-col flex-1 min-h-0 mt-6">
      <h2 className="px-2 pb-1 text-xs font-medium text-gray-500">Chats</h2>
      {chats.length === 0 ? (
        <p className="px-2 text-sm text-gray-500">No chats yet</p>
      ) : (
        <ul className="flex flex-col gap-0.5 overflow-y-auto">
          {chats.map((chat) => {
            const isActive =
              pathname === `/chat/${chat.id}` ||
              (pathname === "/new" && chat.id === createdChatId);

            return (
              <ChatHistoryItem
                key={chat.id}
                chat={chat}
                isActive={isActive}
                onNavigate={onNavigate}
              />
            );
          })}
        </ul>
      )}
    </nav>
  );
}

export default ChatHistory;
