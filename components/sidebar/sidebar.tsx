"use client";

import React, { useState } from "react";

import DesktopSidebar from "@/components/sidebar/desktop-sidebar";
import MobileSidebar from "@/components/sidebar/mobile-sidebar";

function Sidebar() {
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen((prev) => !prev);

  return (
    <>
      <MobileSidebar open={open} onClick={handleToggle} />
      <DesktopSidebar open={open} onClick={handleToggle} />
    </>
  );
}

export default Sidebar;
