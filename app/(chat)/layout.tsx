import Sidebar from "@/components/sidebar/sidebar";
import { ChatHistoryProvider } from "@/contexts/ChatHistoryContext";
import { GuestChatProvider } from "@/contexts/GuestChatContext";
import { getSession } from "@/lib/auth/jwt";
import { listChats } from "@/lib/chat/chat-service";

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();
  const chats = user
    ? await listChats(user.id).catch((error) => {
        console.error(error);
        return [];
      })
    : [];

  return (
    <ChatHistoryProvider key={user?.id ?? "guest"} initialChats={chats}>
      <GuestChatProvider>
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
          <Sidebar />
          {children}
        </div>
      </GuestChatProvider>
    </ChatHistoryProvider>
  );
}
