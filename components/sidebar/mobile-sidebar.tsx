import { Cross2Icon, ViewVerticalIcon } from "@radix-ui/react-icons";
import React from "react";

import Button from "@/components/elements/Button";
import SidebarHeader from "@/components/sidebar/sidebar-header";

interface MobileSidebarProps {
  open: boolean;
  onClick: () => void;
}

function MobileSidebar({ open, onClick }: MobileSidebarProps) {
  return (
    <>
      <nav className="flex p-2 md:hidden">
        <Button onClick={onClick}>
          <ViewVerticalIcon className="w-4 h-4 text-black" />
        </Button>
      </nav>
      <div
        className={`flex flex-col fixed start-0 top-0 h-full z-50 p-2 border-r-1 border-gray-200 bg-gray-50 transition-[width] duration-100 ease-out md:hidden ${!open ? "w-0 opacity-0 invisible" : "w-[18rem] opacity-100 visible"}`}
      >
        <SidebarHeader
          open={open}
          onClick={onClick}
          icon={<Cross2Icon className="w-4 h-4 text-black" />}
        />
      </div>
    </>
  );
}

export default MobileSidebar;
