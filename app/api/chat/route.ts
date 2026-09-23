import { NextRequest } from "next/server";

import {
  UnknownProviderError,
  getProvider,
} from "@/lib/ai/core/provider-registry";
import type { Message, ProviderName } from "@/lib/ai/types";
import { jsonError, streamResponse } from "@/lib/api/responses";
import { getSession } from "@/lib/auth/jwt";
import {
  ChatNotFoundError,
  addAssistantMessage,
  addUserMessage,
} from "@/lib/chat/chat-service";
import { mergeConsecutiveUserMessages } from "@/lib/chat/history";
import { observeStream } from "@/lib/chat/stream";

interface ChatRequest {
  chatId?: string;
  provider: string;
  model: string;
  messages: Message[];
}

export async function POST(req: NextRequest) {
  const { chatId, provider, model, messages }: ChatRequest = await req.json();

  const providerMessages = mergeConsecutiveUserMessages(messages);
  let id: string | undefined;

  try {
    const providerInstance = getProvider(provider as ProviderName);
    const user = await getSession();

    if (!user) {
      if (chatId) return jsonError("Unauthorized", 401);
      return streamResponse(
        await providerInstance.chat(model, providerMessages, true),
      );
    }

    const lastMessage = messages.at(-1);
    if (lastMessage?.role !== "user") {
      return jsonError("Last message must be from the user", 400);
    }

    const savedId = await addUserMessage(user.id, chatId, lastMessage.content);
    id = savedId;
    const stream = await providerInstance.chat(model, providerMessages, true);

    return streamResponse(
      observeStream(stream, {
        onComplete: async (reply) => {
          if (reply) await addAssistantMessage(savedId, reply);
        },
        onCancel: async (partialReply) => {
          if (partialReply) await addAssistantMessage(savedId, partialReply);
        },
      }),
      { "X-Chat-Id": savedId },
    );
  } catch (error) {
    console.error(error);

    if (error instanceof UnknownProviderError) {
      return jsonError(`Provider ${provider} not found`, 400);
    }
    if (error instanceof ChatNotFoundError) {
      return jsonError("Chat not found", 404);
    }

    return jsonError(
      "Failed to stream chat",
      500,
      id ? { "X-Chat-Id": id } : {},
    );
  }
}
