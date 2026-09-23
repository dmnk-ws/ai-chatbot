"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

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
            const href = `/chat/${chat.id}`;
            const isActive =
              pathname === href ||
              (pathname === "/new" && chat.id === createdChatId);

            return (
              <li key={chat.id}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  title={chat.title}
                  onClick={onNavigate}
                  className={`block truncate p-2 rounded-lg text-sm transition-colors hover:bg-gray-200 ${isActive ? "bg-gray-200 font-medium" : "text-gray-700"}`}
                >
                  {chat.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}

export default ChatHistory;
