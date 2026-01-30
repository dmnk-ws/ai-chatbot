"use client";

import { useRouter } from "next/navigation";
import React from "react";

import UserArea from "@/components/sidebar/user-area";
import UserAvatarButton from "@/components/sidebar/user-avatar-button";

interface SidebarContentProps {
  open: boolean;
}

function SidebarContent({ open }: SidebarContentProps) {
  const router = useRouter();
  const user = { name: "John Doe", email: "john.doe@example.org" };
  const isAuthenticated = false;
  const logout = () => {};

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
          <UserArea onClick={logout} name={user.name} />
        ) : (
          <UserArea onClick={handleLoginClick} />
        )}
      </div>
    </div>
  );
}

export default SidebarContent;
