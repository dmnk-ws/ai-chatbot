"use client";

import { EllipsisVertical, Pencil } from "lucide-react";
import Link from "next/link";
import React, { KeyboardEvent, useRef, useState } from "react";

import Input from "@/components/elements/Input";
import Menu from "@/components/elements/Menu";
import { useChatHistory } from "@/contexts/ChatHistoryContext";
import { renameChatApi } from "@/lib/chat/chat-api";
import { normalizeTitle } from "@/lib/chat/title";
import type { ChatSummary } from "@/lib/db/models/Chat";

interface ChatHistoryItemProps {
  chat: ChatSummary;
  isActive: boolean;
  onNavigate?: () => void;
}

function ChatHistoryItem({ chat, isActive, onNavigate }: ChatHistoryItemProps) {
  const { renameChat } = useChatHistory();
  const [draft, setDraft] = useState<string | null>(null);
  const isEditingRef = useRef(false);

  const startRename = () => {
    isEditingRef.current = true;
    setDraft(chat.title);
  };

  const stopEditing = () => {
    isEditingRef.current = false;
    setDraft(null);
  };

  const saveRename = async () => {
    if (!isEditingRef.current || draft === null) return;
    stopEditing();

    const title = normalizeTitle(draft);
    if (!title || title === chat.title) return;

    const previousTitle = chat.title;
    renameChat(chat.id, title);
    try {
      const saved = await renameChatApi(chat.id, title);
      renameChat(chat.id, saved.title);
    } catch {
      renameChat(chat.id, previousTitle);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveRename();
    } else if (e.key === "Escape") {
      e.preventDefault();
      stopEditing();
    }
  };

  if (draft !== null) {
    return (
      <li className="px-0.5 py-0.5">
        <Input
          size="compact"
          ariaLabel="Chat title"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={handleKeyDown}
          onBlur={saveRename}
        />
      </li>
    );
  }

  return (
    <li
      className={`group flex items-center rounded-lg transition-colors hover:bg-gray-200 ${isActive ? "bg-gray-200" : ""}`}
    >
      <Link
        href={`/chat/${chat.id}`}
        aria-current={isActive ? "page" : undefined}
        title={chat.title}
        onClick={onNavigate}
        className={`flex-1 min-w-0 truncate p-2 text-sm ${isActive ? "font-medium" : "text-gray-700"}`}
      >
        {chat.title}
      </Link>
      <div
        className={`shrink-0 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 md:has-[[aria-expanded=true]]:opacity-100 ${isActive ? "md:opacity-100" : ""}`}
      >
        <Menu
          label="Chat options"
          tooltip="right"
          triggerVariant="rowIcon"
          icon={<EllipsisVertical className="w-4 h-4 text-black" />}
          items={[
            {
              label: "Rename",
              icon: <Pencil className="w-4 h-4" />,
              onSelect: startRename,
            },
          ]}
        />
      </div>
    </li>
  );
}

export default ChatHistoryItem;
