import { ReactNode } from "react";

import Sidebar from "@/components/sidebar/sidebar";

export default function ChatLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar />
      {children}
    </div>
  );
}
