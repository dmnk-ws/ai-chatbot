import { notFound, redirect } from "next/navigation";

import Chat from "@/components/chat/chat";
import { getSession } from "@/lib/auth/jwt";
import { getChat } from "@/lib/chat/chat-service";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getSession();
  if (!user) redirect("/login");

  const chat = await getChat(user.id, id);
  if (!chat) notFound();

  return (
    <Chat key={chat.id} chatId={chat.id} initialMessages={chat.messages} />
  );
}
