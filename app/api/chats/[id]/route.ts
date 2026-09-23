import { NextRequest } from "next/server";

import { jsonError } from "@/lib/api/responses";
import { getSession } from "@/lib/auth/jwt";
import {
  ChatNotFoundError,
  deleteChat,
  renameChat,
} from "@/lib/chat/chat-service";
import { normalizeTitle } from "@/lib/chat/title";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const user = await getSession();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const { title } = await req.json();
  const normalized = typeof title === "string" ? normalizeTitle(title) : null;
  if (!normalized) return jsonError("Invalid title", 400);

  try {
    await renameChat(user.id, id, normalized);
    return Response.json({ id, title: normalized });
  } catch (error) {
    if (error instanceof ChatNotFoundError) {
      return jsonError("Chat not found", 404);
    }
    console.error(error);
    return jsonError("Failed to rename chat", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const user = await getSession();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;

  try {
    await deleteChat(user.id, id);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof ChatNotFoundError) {
      return jsonError("Chat not found", 404);
    }
    console.error(error);
    return jsonError("Failed to delete chat", 500);
  }
}
