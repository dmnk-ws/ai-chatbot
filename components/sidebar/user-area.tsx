import { LogIn, LogOut, User } from "lucide-react";
import React from "react";

interface UserAreaProps {
  onClick: () => void;
  name?: string;
}

export default function UserArea({ onClick, name }: UserAreaProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <User className="w-4 h-4 text-black" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {name ?? "Guest"}
          </span>
        </div>
      </div>
      {name ? (
        <LogOut className="w-4 h-4 text-black" />
      ) : (
        <LogIn className="w-4 h-4 text-black" />
      )}
    </button>
  );
}
