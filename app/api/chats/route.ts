import { NextRequest } from "next/server";

import { jsonError } from "@/lib/api/responses";
import { getSession } from "@/lib/auth/jwt";
import { createChat } from "@/lib/chat/chat-service";
import { isMessageList } from "@/lib/chat/validate";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return jsonError("Unauthorized", 401);

  const { messages } = await req.json();
  if (
    !isMessageList(messages) ||
    messages.length === 0 ||
    messages.some((m) => !m.content)
  ) {
    return jsonError("Invalid messages", 400);
  }

  try {
    return Response.json(await createChat(user.id, messages), { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to create chat", 500);
  }
}
