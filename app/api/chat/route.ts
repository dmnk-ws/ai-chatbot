import { NextRequest } from "next/server";

import { mistral } from "@/lib/ai/providers/mistral";

export async function POST(req: NextRequest) {
  const { model, messages } = await req.json();

  try {
    const stream = await mistral.chatStream(model, messages);

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
