import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import NewChat from "@/components/chat/new-chat";
import ChatHistory from "@/components/sidebar/chat-history";
import NewChatButton from "@/components/sidebar/new-chat-button";
import { saveGuestChat } from "@/lib/chat/guest-chat-storage";
import { server } from "@/test/msw";
import { router } from "@/test/navigation";
import {
  mockChatReply,
  mockStreamingChatReply,
  renderWithProviders,
  sendMessage,
} from "@/test/render";

vi.mock("next/navigation", () => import("@/test/navigation"));

function clickNewChat() {
  fireEvent.click(screen.getByRole("button", { name: "New chat" }));
}

describe("NewChat", () => {
  it("lets guests chat", async () => {
    mockChatReply("pong");
    await renderWithProviders(<NewChat />, { loggedIn: false });

    await sendMessage("ping", "pong");

    expect(screen.getByText("ping")).toBeTruthy();
  });

  it("keeps a guest chat across reloads", async () => {
    mockChatReply("pong");
    await renderWithProviders(<NewChat />, { loggedIn: false });
    await sendMessage("ping", "pong");

    cleanup();
    await renderWithProviders(<NewChat />, { loggedIn: false });

    expect(screen.getByText("ping")).toBeTruthy();
    expect(screen.getByText("pong")).toBeTruthy();
  });

  it("keeps an unanswered guest message across reloads", async () => {
    mockChatReply("pong");
    await renderWithProviders(<NewChat />, { loggedIn: false });
    await sendMessage("ping", "pong");
    server.use(
      http.post("*/api/chat", () =>
        HttpResponse.json({ error: "Failed to stream chat" }, { status: 500 }),
      ),
    );
    await sendMessage("again", "Couldn't get a response.");

    cleanup();
    await renderWithProviders(<NewChat />, { loggedIn: false });

    expect(screen.getByText("ping")).toBeTruthy();
    expect(screen.getByText("pong")).toBeTruthy();
    expect(screen.getByText("again")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("keeps the URL when leaving a new chat before it has been saved", async () => {
    let respond = () => {};
    const responded = new Promise<void>((resolve) => (respond = resolve));
    server.use(
      http.post("*/api/chat", async () => {
        await responded;
        return new HttpResponse("pong", { headers: { "X-Chat-Id": "chat-1" } });
      }),
    );
    await renderWithProviders(
      <>
        <NewChatButton open />
        <ChatHistory />
        <NewChat />
      </>,
      { loggedIn: true },
    );
    const textarea = screen.getByPlaceholderText("Write a message...");
    fireEvent.change(textarea, { target: { value: "ping" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    clickNewChat();
    respond();

    await waitFor(() =>
      expect(screen.getByRole("link").textContent).toBe("ping"),
    );
    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.getByRole("link").getAttribute("aria-current")).toBeNull();
    expect(screen.getByText("Hello there!")).toBeTruthy();
  });

  it("starts empty when clicking New chat in a chat that has just been saved", async () => {
    // Next.js restores the preserved /new segment instead of rendering it fresh
    router.push.mockImplementationOnce(() => {});
    mockChatReply("pong", "chat-1");
    await renderWithProviders(
      <>
        <NewChatButton open />
        <NewChat />
      </>,
      { loggedIn: true },
    );
    await sendMessage("ping", "pong");

    clickNewChat();

    expect(screen.getByText("Hello there!")).toBeTruthy();
    expect(screen.queryByText("pong")).toBeNull();
  });

  it("stays on a new chat when the previous reply finishes", async () => {
    const reply = mockStreamingChatReply("po", "chat-1");
    await renderWithProviders(
      <>
        <NewChatButton open />
        <NewChat />
      </>,
      { loggedIn: true },
    );
    await sendMessage("ping", "po");

    clickNewChat();
    await reply.finish("ng");

    expect(screen.getByText("Hello there!")).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });

  describe("guest with a reply still streaming", () => {
    async function startGuestChat() {
      const reply = mockStreamingChatReply("po");
      await renderWithProviders(
        <>
          <NewChatButton open />
          <NewChat />
        </>,
        { loggedIn: false },
      );
      await sendMessage("ping", "po");
      return reply;
    }

    it("asks before discarding the chat", async () => {
      const reply = await startGuestChat();

      clickNewChat();

      expect(
        screen.getByRole("dialog", { name: "Start a new chat?" }),
      ).toBeTruthy();
      await reply.finish("ng");
    });

    it("does not bring a cleared chat back when its reply finishes", async () => {
      const reply = await startGuestChat();

      clickNewChat();
      const dialog = screen.getByRole("dialog", { name: "Start a new chat?" });
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Clear chat" }),
      );
      expect(screen.getByText("Hello there!")).toBeTruthy();

      await reply.finish("ng");
      expect(screen.getByText("Hello there!")).toBeTruthy();

      cleanup();
      await renderWithProviders(<NewChat />, { loggedIn: false });

      expect(screen.getByText("Hello there!")).toBeTruthy();
      expect(screen.queryByText("ping")).toBeNull();
    });
  });

  it("starts empty for logged-in users", async () => {
    saveGuestChat([{ role: "user", content: "old guest message" }]);

    await renderWithProviders(<NewChat />, { loggedIn: true });

    expect(screen.getByText("Hello there!")).toBeTruthy();
    expect(screen.queryByText("old guest message")).toBeNull();
  });
});
