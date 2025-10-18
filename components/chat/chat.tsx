"use client";

import React, { useEffect, useRef } from "react";

import ChatForm from "@/components/chat/chat-form";
import Message from "@/components/chat/message";
import { useModel } from "@/contexts/ModelContext";
import { useChat } from "@/hooks/useChat";

import Welcome from "./welcome";

function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedModel, selectedProvider } = useModel();
  const { messages, input, handleSubmit, handleChange, handleEnter } = useChat({
    provider: selectedProvider,
    model: selectedModel,
  });

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
