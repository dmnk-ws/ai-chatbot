import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import Chat from "@/components/chat/chat";
import ChatHistory from "@/components/sidebar/chat-history";
import { server } from "@/test/msw";
import { router } from "@/test/navigation";
import {
  mockChatReply,
  mockStreamingChatReply,
  renderWithProviders,
  sendMessage,
} from "@/test/render";

vi.mock("next/navigation", () => import("@/test/navigation"));

function historyTitles() {
  return screen.getAllByRole("link").map((link) => link.textContent);
}

function isMarkedOpen(title: string) {
  return (
    screen.getByRole("link", { name: title }).getAttribute("aria-current") ===
    "page"
  );
}

describe("Chat", () => {
  it("shows the welcome message for an empty chat", async () => {
    await renderWithProviders(<Chat />, { loggedIn: true });

    expect(screen.getByText("Hello there!")).toBeTruthy();
  });

  it("shows the messages of an existing chat", async () => {
    await renderWithProviders(
      <Chat
        chatId="b"
        initialMessages={[
          { role: "user", content: "Plan a trip" },
          { role: "assistant", content: "Where to?" },
        ]}
      />,
      { loggedIn: true },
    );

    expect(screen.getByText("Plan a trip")).toBeTruthy();
    expect(screen.getByText("Where to?")).toBeTruthy();
  });

  it("opens a new chat once it has been saved", async () => {
    mockChatReply("pong", "chat-1");
    await renderWithProviders(
      <>
        <ChatHistory />
        <Chat />
      </>,
      { loggedIn: true },
    );

    await sendMessage("ping", "pong");

    expect(historyTitles()).toEqual(["ping"]);
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/chat/chat-1"),
    );
  });

  it("shows a new chat in the history while the reply is still streaming", async () => {
    const reply = mockStreamingChatReply("po", "chat-1");
    await renderWithProviders(
      <>
        <ChatHistory />
        <Chat />
      </>,
      { loggedIn: true },
    );

    await sendMessage("ping", "po");

    expect(historyTitles()).toEqual(["ping"]);
    expect(isMarkedOpen("ping")).toBe(true);
    expect(router.replace).not.toHaveBeenCalled();

    await reply.finish("ng");

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/chat/chat-1"),
    );
  });

  it("offers a retry when a saved chat gets no reply", async () => {
    let fail = true;
    server.use(
      http.post("*/api/chat", () => {
        if (!fail) {
          return new HttpResponse("pong", {
            headers: { "X-Chat-Id": "chat-1" },
          });
        }
        fail = false;
        return HttpResponse.json(
          { error: "Failed to stream chat" },
          { status: 500, headers: { "X-Chat-Id": "chat-1" } },
        );
      }),
    );
    await renderWithProviders(
      <>
        <ChatHistory />
        <Chat />
      </>,
      { loggedIn: true },
    );

    await sendMessage("ping", "Couldn't get a response.");

    expect(historyTitles()).toEqual(["ping"]);
    expect(isMarkedOpen("ping")).toBe(true);
    expect(router.replace).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByText("pong");
    const conversation = within(screen.getByRole("main"));
    expect(conversation.getAllByText("ping")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/chat/chat-1"),
    );
  });

  it("offers a retry when reopening a chat without a reply", async () => {
    await renderWithProviders(
      <Chat
        chatId="b"
        initialMessages={[{ role: "user", content: "Plan a trip" }]}
      />,
      { loggedIn: true },
    );

    expect(screen.getByText("Couldn't get a response.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("moves a continued chat to the top of the history", async () => {
    mockChatReply("Sure!");
    await renderWithProviders(
      <>
        <ChatHistory />
        <Chat
          chatId="b"
          initialMessages={[{ role: "user", content: "Plan a trip" }]}
        />
      </>,
      {
        loggedIn: true,
        chats: [
          { id: "a", title: "Recipes" },
          { id: "b", title: "Travel plans" },
        ],
      },
    );

    await sendMessage("Rome", "Sure!");

    expect(historyTitles()).toEqual(["Travel plans", "Recipes"]);
    expect(router.replace).not.toHaveBeenCalled();
  });
});
