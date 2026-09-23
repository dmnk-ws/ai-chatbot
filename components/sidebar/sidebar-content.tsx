"use client";

import { useRouter } from "next/navigation";

import ChatHistory from "@/components/sidebar/chat-history";
import NewChatButton from "@/components/sidebar/new-chat-button";
import UserArea from "@/components/sidebar/user-area";
import UserAvatarButton from "@/components/sidebar/user-avatar-button";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarContentProps {
  open: boolean;
  onNavigate?: () => void;
}

function SidebarContent({ open, onNavigate }: SidebarContentProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/new");
  };

  if (!open) {
    return (
      <div className="flex flex-col flex-1 min-h-0 mt-4">
        <NewChatButton open={open} onNavigate={onNavigate} />
        <div className="mt-auto">
          {isAuthenticated ? (
            <UserAvatarButton label="Log out" onClick={handleLogout} />
          ) : (
            <UserAvatarButton label="Log in" onClick={handleLoginClick} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 mt-4">
      <NewChatButton open={open} onNavigate={onNavigate} />
      {isAuthenticated && <ChatHistory onNavigate={onNavigate} />}
      <div className="mt-auto pt-2 border-t border-gray-200">
        {isAuthenticated ? (
          <UserArea
            onClick={handleLogout}
            name={`${user.firstName} ${user.lastName}`}
          />
        ) : (
          <UserArea onClick={handleLoginClick} />
        )}
      </div>
    </div>
  );
}

export default SidebarContent;
