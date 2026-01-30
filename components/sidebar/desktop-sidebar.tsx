import { PanelLeft } from "lucide-react";
import React from "react";

import SidebarContent from "@/components/sidebar/sidebar-content";
import SidebarHeader from "@/components/sidebar/sidebar-header";

interface DesktopSidebarProps {
  open: boolean;
  onClick: () => void;
}

function DesktopSidebar({ open, onClick }: DesktopSidebarProps) {
  return (
    <nav
      className={`hidden md:flex flex-col p-2 border-r-1 border-gray-200 transition-all duration-200 ease-out ${open ? "w-[18rem] bg-gray-100" : "w-[3rem]"}`}
    >
      <SidebarHeader
        open={open}
        onClick={onClick}
        icon={<PanelLeft className="w-4 h-4 text-black" />}
      />
      <SidebarContent open={open} />
    </nav>
  );
}

export default DesktopSidebar;
