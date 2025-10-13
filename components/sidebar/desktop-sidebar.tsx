import { ViewVerticalIcon } from "@radix-ui/react-icons";
import React from "react";

import SidebarHeader from "@/components/sidebar/sidebar-header";

interface DesktopSidebarProps {
  open: boolean;
  onClick: () => void;
}

function DesktopSidebar({ open, onClick }: DesktopSidebarProps) {
  return (
    <nav
      className={`hidden md:flex flex-col items-center p-2 border-r-1 border-gray-200 transition-[width] duration-200 ease-out ${open ? "w-[18rem] bg-gray-100" : "w-[3rem]"}`}
    >
      <SidebarHeader
        open={open}
        onClick={onClick}
        icon={<ViewVerticalIcon className="w-4 h-4 text-black" />}
      />
    </nav>
  );
}

export default DesktopSidebar;
