"use client";

import React from "react";

import Chat from "@/components/chat/chat";
import { useAuth } from "@/contexts/AuthContext";
import { useChatHistory } from "@/contexts/ChatHistoryContext";
import { useGuestChat } from "@/contexts/GuestChatContext";
import type { Message } from "@/lib/ai/types";

function NewChat() {
  const { isAuthenticated, isLoading } = useAuth();
  const guestChat = useGuestChat();
  const { newChatKey, isCurrentNewChat } = useChatHistory();

  if (isLoading || !guestChat.isLoaded) return <Chat key="loading" />;
  if (isAuthenticated) return <Chat key={`user-${newChatKey}`} />;

  const saveGuestChat = (messages: Message[]) => {
    if (isCurrentNewChat(newChatKey)) guestChat.setMessages(messages);
  };

  return (
    <Chat
      key={`guest-${newChatKey}`}
      initialMessages={guestChat.messages}
      onMessageSent={saveGuestChat}
      onReplyReceived={saveGuestChat}
    />
  );
}

export default NewChat;
