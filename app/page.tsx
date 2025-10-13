"use client";

import React, { useState } from "react";
import { ViewVerticalIcon } from "@radix-ui/react-icons";

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-row">
      <nav
        className={`flex flex-col items-center p-2 border-r-1 border-gray-200 transition-[width] duration-200 ease-out ${open ? "w-[18rem] bg-gray-100" : "w-[3rem]"}`}
      >
        <div className="flex flex-row items-center justify-between w-full">
          {open && <h1 className="text-lg font-bold px-2">Chatbot</h1>}
          <div className="gap-2 cursor-pointer">
            <button
              className="cursor-pointer p-2 hover:bg-gray-200 rounded-md"
              onClick={() => setOpen((prev) => !prev)}
            >
              <ViewVerticalIcon className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </nav>
      <main className="flex flex-col flex-1 min-h-screen">
        <div className="flex-1 mx-auto w-full min-w-0 max-w-4xl">
          <div className="w-full h-full overflow-auto">
            <div className="flex flex-col w-full gap-4 px-2 py-4 md:gap-6 md:px-4">
              Chatbot
            </div>
          </div>
          <div className="sticky bottom-0 w-full mx-auto min-w-0 max-w-4xl px-2 pb-3 md:px-4 md:pb-4">
            <div className="relative flex flex-col w-full gap-4">
              <form className="w-full p-3 border rounded-2xl shadow-xs border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-md focus-within:border-gray-300 focus-within:shadow-md">
                <textarea
                  className="w-full min-h-20 focus:outline-none resize-none"
                  placeholder="Write a message..."
                ></textarea>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
