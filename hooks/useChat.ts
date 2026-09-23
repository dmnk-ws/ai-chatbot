import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  SubmitEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Message } from "@/lib/ai/types";

interface UseChatOptions {
  initialMessages?: Message[];
  provider: string;
  model: string;
  chatId?: string;
  onMessageSent?: (messages: Message[]) => void;
  onChatCreated?: (chatId: string, firstMessage: string) => void;
  onReplyReceived?: (messages: Message[]) => void;
}

interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  canRetry: boolean;
  handleSubmit: (e: SubmitEvent) => Promise<void>;
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleEnter: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  retry: () => Promise<void>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
}

export function useChat({
  initialMessages = [],
  provider,
  model,
  chatId,
  onMessageSent,
  onChatCreated,
  onReplyReceived,
}: UseChatOptions): UseChatReturn {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatIdRef = useRef(chatId);

  const canRetry = !isLoading && messages.at(-1)?.role === "user";

  const requestReply = useCallback(
    async (history: Message[]) => {
      setIsLoading(true);

      const assistantMessageIndex = history.length;
      setMessages([...history, { role: "assistant", content: "" }]);

      const setAssistantMessage = (content: string) =>
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = { role: "assistant", content };
          return newMessages;
        });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: chatIdRef.current,
          provider,
          model,
          messages: history,
        }),
      }).catch(() => null);

      const createdChatId = chatIdRef.current
        ? null
        : response?.headers.get("X-Chat-Id");
      if (createdChatId) {
        chatIdRef.current = createdChatId;
        onChatCreated?.(createdChatId, history[history.length - 1].content);
      }

      try {
        if (!response?.ok || !response.body) throw new Error();

        let assistantContent = "";

        const textStream = response.body.pipeThrough(new TextDecoderStream());
        const reader = textStream.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          assistantContent += value;
          setAssistantMessage(assistantContent);
        }

        onReplyReceived?.([
          ...history,
          { role: "assistant", content: assistantContent },
        ]);
      } catch {
        setMessages(history);
      } finally {
        setIsLoading(false);
      }
    },
    [provider, model, onChatCreated, onReplyReceived],
  );

  const handleSubmit = useCallback(
    async (e: SubmitEvent) => {
      e.preventDefault();

      if (!input.trim() || isLoading) return;

      const history: Message[] = [
        ...messages,
        { role: "user", content: input },
      ];
      setInput("");
      onMessageSent?.(history);

      await requestReply(history);
    },
    [input, isLoading, messages, onMessageSent, requestReply],
  );

  const retry = useCallback(async () => {
    if (!canRetry) return;
    await requestReply(messages);
  }, [canRetry, messages, requestReply]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as SubmitEvent);
      }
    },
    [handleSubmit],
  );

  return useMemo(
    () => ({
      messages,
      input,
      isLoading,
      canRetry,
      handleSubmit,
      handleChange,
      handleEnter,
      retry,
      setMessages,
    }),
    [
      messages,
      input,
      isLoading,
      canRetry,
      handleSubmit,
      handleChange,
      handleEnter,
      retry,
    ],
  );
}
