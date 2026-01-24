import { NextRequest } from "next/server";

import { getProvider } from "@/lib/ai/core/provider-registry";
import type { ProviderName } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  const { provider, model, messages } = await req.json();

  try {
    const providerInstance = getProvider(provider as ProviderName);

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

    if (error instanceof Error && error.message.includes("Provider")) {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not found` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ error: "Failed to stream chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
