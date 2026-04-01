import { redirect } from "next/navigation";

import Sidebar from "@/components/sidebar/sidebar";
import { getSession } from "@/lib/auth/jwt";

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar />
      {children}
    </div>
  );
}
