import React, { ReactNode } from "react";

import Button from "@/components/elements/Button";

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
        <Button onClick={onClick}>{icon}</Button>
      </div>
    </header>
  );
}

export default SidebarHeader;
