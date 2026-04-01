"use client";

import { useRouter } from "next/navigation";

import UserArea from "@/components/sidebar/user-area";
import UserAvatarButton from "@/components/sidebar/user-avatar-button";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarContentProps {
  open: boolean;
}

function SidebarContent({ open }: SidebarContentProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLoginClick = () => {
    router.push("/login");
  };

  if (!open) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="mt-auto">
          {isAuthenticated ? (
            <UserAvatarButton onClick={logout} />
          ) : (
            <UserAvatarButton onClick={handleLoginClick} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="mt-auto pt-2 border-t border-gray-200">
        {isAuthenticated ? (
          <UserArea
            onClick={logout}
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
