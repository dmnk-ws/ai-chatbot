import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import NewChatButton from "@/components/sidebar/new-chat-button";
import { saveGuestChat } from "@/lib/chat/guest-chat-storage";
import { router } from "@/test/navigation";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => import("@/test/navigation"));

function clickNewChat() {
  fireEvent.click(screen.getByRole("button", { name: "New chat" }));
}

function withGuestChat() {
  saveGuestChat([
    { role: "user", content: "ping" },
    { role: "assistant", content: "pong" },
  ]);
}

describe("NewChatButton", () => {
  it("starts a new chat for logged-in users", async () => {
    await renderWithProviders(<NewChatButton open />, { loggedIn: true });

    clickNewChat();

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(router.push).toHaveBeenCalledWith("/new");
  });

  it("starts a new chat for guests without messages", async () => {
    await renderWithProviders(<NewChatButton open />, { loggedIn: false });

    clickNewChat();

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(router.push).toHaveBeenCalledWith("/new");
  });

  describe("guest with an unsaved chat", () => {
    async function openDialog() {
      withGuestChat();
      await renderWithProviders(<NewChatButton open />, { loggedIn: false });
      clickNewChat();
      return screen.getByRole("dialog", { name: "Start a new chat?" });
    }

    it("warns that the chat isn't saved", async () => {
      const dialog = await openDialog();

      expect(dialog.textContent).toContain(
        "Your current chat isn't saved. Log in to keep it.",
      );
      expect(router.push).not.toHaveBeenCalled();
    });

    it("clears the chat", async () => {
      const dialog = await openDialog();

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Clear chat" }),
      );

      expect(screen.queryByRole("dialog")).toBeNull();
      clickNewChat();
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("sends the user to log in", async () => {
      const dialog = await openDialog();

      fireEvent.click(within(dialog).getByRole("button", { name: "Log in" }));

      expect(router.push).toHaveBeenCalledWith("/login");
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
