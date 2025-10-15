import Chat from "@/components/chat/chat";
import Sidebar from "@/components/sidebar/sidebar";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar />
      <Chat />
    </div>
  );
}
