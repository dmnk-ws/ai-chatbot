import { NextRequest } from "next/server";

import { anthropic } from "@/lib/ai/providers/anthropic";
import { mistral } from "@/lib/ai/providers/mistral";
import { openai } from "@/lib/ai/providers/openai";

const providers = {
  Anthropic: anthropic,
  OpenAI: openai,
  Mistral: mistral,
};

export async function POST(req: NextRequest) {
  const { provider, model, messages } = await req.json();

  try {
    const providerInstance = providers[provider as keyof typeof providers];

    if (!providerInstance) {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not found` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const stream = await providerInstance.chat(model, messages, true);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to stream chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
