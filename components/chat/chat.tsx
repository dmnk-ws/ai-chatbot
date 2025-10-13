import React from "react";

function Chat() {
  return (
    <main className="flex min-h-screen w-full">
      <div className="flex flex-col flex-1 mx-auto w-full min-w-0 max-w-4xl">
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
  );
}

export default Chat;
