import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ChatHistory from "@/components/sidebar/chat-history";
import { navigate } from "@/test/navigation";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => import("@/test/navigation"));

const CHATS = [
  { id: "a", title: "Recipes" },
  { id: "b", title: "Travel plans" },
];

describe("ChatHistory", () => {
  it("links to each chat", async () => {
    await renderWithProviders(<ChatHistory />, {
      loggedIn: true,
      chats: CHATS,
    });

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Recipes",
      "Travel plans",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/chat/a",
      "/chat/b",
    ]);
  });

  it("marks the open chat", async () => {
    navigate("/chat/b");

    await renderWithProviders(<ChatHistory />, {
      loggedIn: true,
      chats: CHATS,
    });

    expect(
      screen
        .getByRole("link", { name: "Travel plans" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen
        .getByRole("link", { name: "Recipes" })
        .getAttribute("aria-current"),
    ).toBeNull();
  });

  it("says when there are no chats yet", async () => {
    await renderWithProviders(<ChatHistory />, { loggedIn: true });

    expect(screen.getByText("No chats yet")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
