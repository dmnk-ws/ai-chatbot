import { Sparkles } from "lucide-react";
import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { markdownComponents } from "@/components/chat/markdown-components";
import type { Message as MessageType } from "@/lib/ai/core/base-provider";

function Message({ role, content }: MessageType) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  return (
    <div
      className={`flex flex-row rounded-2xl px-2 ${
        isUser ? "justify-center bg-blue-500 self-end max-w-[70%]" : "justify-start"
      }`}
    >
      {isAssistant && (
        <div className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-3xl  py-2 px-3 m-2">
          <Sparkles className="w-5 h-5 rounded-full" />
        </div>
      )}
      <div
        className={`${isUser ? "py-2 px-3 text-white" : "pl-2 pr-8 pb-8 pt-2"}`}
      >
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={!isUser ? markdownComponents : null}
        >
          {isAssistant
            ? content.replace(
                /^([\p{Emoji}\p{Emoji_Presentation}])\s+(.+)$/gmu,
                "\n $1 $2",
              )
            : content}
        </Markdown>
      </div>
    </div>
  );
}

export default Message;
