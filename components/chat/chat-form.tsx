import { ArrowUp } from "lucide-react";
import React from "react";

import Button from "@/components/elements/Button";

interface ChatFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleEnter: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  input: string;
}

function ChatForm({
  handleSubmit,
  handleChange,
  handleEnter,
  input,
}: ChatFormProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-3 border rounded-2xl shadow-xs border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-md focus-within:border-gray-300 focus-within:shadow-md"
    >
      <div className="relative flex flex-col w-full gap-4">
        <textarea
          name="user-message"
          className="w-full min-h-20 focus:outline-none resize-none"
          placeholder="Write a message..."
          onChange={handleChange}
          value={input}
          onKeyDown={handleEnter}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Button type="submit" disabled={input?.trim() === ""}>
          <ArrowUp className="w-4 h-4 text-black" />
        </Button>
      </div>
    </form>
  );
}

export default ChatForm;
