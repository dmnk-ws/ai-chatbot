import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  KeyboardEvent,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

import { Message } from "@/lib/ai/core/base-provider";

interface UseChatOptions {
  initialMessages?: Message[];
  provider: string;
  model: string;
}

interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleEnter: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  setMessages: Dispatch<SetStateAction<Message[]>>;
}

export function useChat({
  initialMessages = [],
  provider,
  model,
}: UseChatOptions): UseChatReturn {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!input.trim() || isLoading) return;

      setIsLoading(true);

      const userMessage: Message = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const assistantMessageIndex = messages.length + 1;
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          model,
          messages: [...messages, userMessage],
        }),
      }).catch(() => {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = {
            role: "assistant",
            content: "Error: Failed to get response",
          };
          return newMessages;
        });
        setIsLoading(false);
        return;
      });

      if (!response || !response.ok || !response.body) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = {
            role: "assistant",
            content: "Error: Failed to get response",
          };
          return newMessages;
        });
        setIsLoading(false);
        return;
      }

      let assistantContent = "";

      const textStream = response.body.pipeThrough(new TextDecoderStream());
      const reader = textStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        console.log(value);

        assistantContent += value;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = {
            role: "assistant",
            content: assistantContent,
          };
          return newMessages;
        });
      }

      setIsLoading(false);
    },
    [input, isLoading, messages, provider, model],
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit],
  );

  return useMemo(
    () => ({
      messages,
      input,
      isLoading,
      handleSubmit,
      handleChange,
      handleEnter,
      setMessages,
    }),
    [messages, input, isLoading, handleSubmit, handleChange, handleEnter],
  );
}
