"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef } from "react";

import ChatForm from "@/components/chat/chat-form";
import Message from "@/components/chat/message";
import Button from "@/components/elements/Button";
import { useChatHistory } from "@/contexts/ChatHistoryContext";
import { useModel } from "@/contexts/ModelContext";
import { useChat } from "@/hooks/useChat";
import type { Message as MessageType } from "@/lib/ai/types";
import { chatTitle } from "@/lib/chat/title";

import Welcome from "./welcome";

interface ChatProps {
  chatId?: string;
  initialMessages?: MessageType[];
  onMessageSent?: (messages: MessageType[]) => void;
  onReplyReceived?: (messages: MessageType[]) => void;
}

function Chat({
  chatId,
  initialMessages,
  onMessageSent,
  onReplyReceived,
}: ChatProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const createdChatIdRef = useRef<string | null>(null);
  const { selectedModel, selectedProvider } = useModel();
  const { addChat, touchChat, setCreatedChatId } = useChatHistory();

  const handleMessageSent = useCallback(
    (messages: MessageType[]) => {
      if (chatId) touchChat(chatId);
      onMessageSent?.(messages);
    },
    [chatId, touchChat, onMessageSent],
  );

  const handleChatCreated = useCallback(
    (id: string, firstMessage: string) => {
      addChat({ id, title: chatTitle(firstMessage) });
      createdChatIdRef.current = id;
      if (isMountedRef.current) setCreatedChatId(id);
    },
    [addChat, setCreatedChatId],
  );

  const handleReplyReceived = useCallback(
    (messages: MessageType[]) => {
      onReplyReceived?.(messages);

      const createdChatId = createdChatIdRef.current;
      if (createdChatId && isMountedRef.current) {
        createdChatIdRef.current = null;
        router.replace(`/chat/${createdChatId}`);
      }
    },
    [onReplyReceived, router],
  );

  const {
    messages,
    input,
    canRetry,
    handleSubmit,
    handleChange,
    handleEnter,
    retry,
  } = useChat({
    initialMessages,
    provider: selectedProvider,
    model: selectedModel,
    chatId,
    onMessageSent: handleMessageSent,
    onChatCreated: handleChatCreated,
    onReplyReceived: handleReplyReceived,
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex w-full h-full overflow-hidden">
      <div className="flex flex-col flex-1 mx-auto min-w-0 max-w-4xl h-full">
        <div className="flex flex-col py-4 gap-4 px-4 flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <Welcome />
          ) : (
            messages.map((msg, idx) => (
              <Message key={idx} role={msg.role} content={msg.content} />
            ))
          )}
          {canRetry && (
            <div className="flex items-center gap-3 px-2 text-sm text-gray-600">
              <span>Couldn&apos;t get a response.</span>
              <Button ariaLabel="Retry" tooltip="top" onClick={retry}>
                <RotateCcw className="w-4 h-4 text-black" />
              </Button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="sticky bottom-0 w-full mx-auto min-w-0 max-w-4xl px-2 pb-3 md:px-4 md:pb-4 bg-white">
          <ChatForm
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            handleEnter={handleEnter}
            input={input}
          />
        </div>
      </div>
    </main>
  );
}

export default Chat;
