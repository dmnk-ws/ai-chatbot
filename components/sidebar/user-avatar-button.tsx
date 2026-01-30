import { User } from "lucide-react";
import React from "react";

interface UserAvatarButtonProps {
  onClick: () => void;
  name?: string;
}

export default function UserAvatarButton({ onClick }: UserAvatarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-start w-full h-9 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer p-2"
    >
      <User className="w-4 h-4 shrink-0 text-black" />
    </button>
  );
}
