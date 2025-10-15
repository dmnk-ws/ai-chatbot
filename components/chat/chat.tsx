"use client";

import { ArrowUpIcon, MagicWandIcon } from "@radix-ui/react-icons";
import React, { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Button from "@/components/elements/Button";
import { useChat } from "@/hooks/useChat";

import { markdownComponents } from "./markdown-components";

function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleSubmit, handleChange, handleEnter } = useChat({
    provider: "mistral",
    model: "mistral-large-latest",
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex min-h-screen w-full">
      <div className="flex flex-col flex-1 mx-auto min-w-0 max-w-4xl">
        <div className="flex flex-col py-4 gap-4 px-4 h-full overflow-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-row justify-center rounded-2xl px-2 ${
                msg.role === "user" && "bg-blue-500 self-end max-w-[70%]"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-3xl  py-2 px-3 m-2">
                  <MagicWandIcon className="w-5 h-5 rounded-full" />
                </div>
              )}
              <div
                className={`${msg.role === "user" ? "py-2 px-3 text-white" : "pl-2 pr-8 pb-8 pt-2"}`}
              >
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={msg.role !== "user" ? markdownComponents : null}
                >
                  {msg.role === "assistant"
                    ? msg.content.replace(
                        /^([\p{Emoji}\p{Emoji_Presentation}])\s+(.+)$/gmu,
                        "\n $1 $2",
                      )
                    : msg.content}
                </Markdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="sticky bottom-0 w-full mx-auto min-w-0 max-w-4xl px-2 pb-3 md:px-4 md:pb-4 bg-white">
          <form
            onSubmit={handleSubmit}
            className="w-full p-3 border rounded-2xl shadow-xs border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-md focus-within:border-gray-300 focus-within:shadow-md"
          >
            <div className="relative flex flex-col w-full gap-4">
              <textarea
                className="w-full min-h-20 focus:outline-none resize-none"
                placeholder="Write a message..."
                onChange={handleChange}
                value={input}
                onKeyDown={handleEnter}
              ></textarea>
            </div>
            <div className="flex items-center justify-end">
              <Button type="submit">
                <ArrowUpIcon className="w-4 h-4 text-black" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Chat;
