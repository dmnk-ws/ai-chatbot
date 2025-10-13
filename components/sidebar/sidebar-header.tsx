import React, { ReactNode } from "react";

interface SidebarHeaderProps {
  open: boolean;
  onClick: () => void;
  icon: ReactNode;
}

function SidebarHeader({ open, onClick, icon }: SidebarHeaderProps) {
  return (
    <header className="flex flex-row items-center justify-between w-full">
      {open && <h1 className="text-lg font-bold px-2">Chatbot</h1>}
      <div className="gap-2 cursor-pointer">
        <button
          className="cursor-pointer p-2 hover:bg-gray-200 rounded-md"
          onClick={onClick}
        >
          {icon}
        </button>
      </div>
    </header>
  );
}

export default SidebarHeader;
