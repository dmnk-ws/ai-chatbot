import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import ChatHistory from "@/components/sidebar/chat-history";
import { server } from "@/test/msw";
import { navigate, router } from "@/test/navigation";
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

  describe("renaming", () => {
    function mockRename(status = 200) {
      const titles: string[] = [];
      server.use(
        http.patch("*/api/chats/:id", async ({ request, params }) => {
          const { title } = (await request.json()) as { title: string };
          titles.push(title);
          return status === 200
            ? HttpResponse.json({ id: params.id, title })
            : HttpResponse.json({ error: "Failed" }, { status });
        }),
      );
      return titles;
    }

    async function startRenaming(title: string) {
      await renderWithProviders(<ChatHistory />, {
        loggedIn: true,
        chats: CHATS,
      });
      const row = screen.getByRole("link", { name: title }).closest("li")!;
      fireEvent.click(
        within(row).getByRole("button", { name: "Chat options" }),
      );
      fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
      return screen.getByRole("textbox", { name: "Chat title" });
    }

    function titles() {
      return screen.getAllByRole("link").map((link) => link.textContent);
    }

    it("opens the title for editing", async () => {
      const input = await startRenaming("Recipes");

      expect((input as HTMLInputElement).value).toBe("Recipes");
      expect(document.activeElement).toBe(input);
    });

    it("saves the new title on Enter", async () => {
      const saved = mockRename();
      const input = await startRenaming("Recipes");

      fireEvent.change(input, { target: { value: "Pasta ideas" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(titles()).toEqual(["Pasta ideas", "Travel plans"]);
      await waitFor(() => expect(saved).toEqual(["Pasta ideas"]));
    });

    it("saves the new title when clicking outside", async () => {
      const saved = mockRename();
      const input = await startRenaming("Recipes");

      fireEvent.change(input, { target: { value: "Pasta ideas" } });
      fireEvent.blur(input);

      expect(titles()).toEqual(["Pasta ideas", "Travel plans"]);
      await waitFor(() => expect(saved).toEqual(["Pasta ideas"]));
    });

    it("keeps the old title on Escape", async () => {
      const saved = mockRename();
      const input = await startRenaming("Recipes");

      fireEvent.change(input, { target: { value: "Pasta ideas" } });
      fireEvent.keyDown(input, { key: "Escape" });

      expect(titles()).toEqual(["Recipes", "Travel plans"]);
      expect(saved).toEqual([]);
    });

    it("keeps the old title when the new one is empty", async () => {
      const saved = mockRename();
      const input = await startRenaming("Recipes");

      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(titles()).toEqual(["Recipes", "Travel plans"]);
      expect(saved).toEqual([]);
    });

    it("restores the old title when saving fails", async () => {
      mockRename(500);
      const input = await startRenaming("Recipes");

      fireEvent.change(input, { target: { value: "Pasta ideas" } });
      fireEvent.keyDown(input, { key: "Enter" });

      await waitFor(() =>
        expect(titles()).toEqual(["Recipes", "Travel plans"]),
      );
    });
  });

  describe("deleting", () => {
    function mockDelete(status = 204) {
      const deleted: string[] = [];
      server.use(
        http.delete("*/api/chats/:id", ({ params }) => {
          deleted.push(params.id as string);
          return status === 204
            ? new HttpResponse(null, { status })
            : HttpResponse.json({ error: "Failed" }, { status });
        }),
      );
      return deleted;
    }

    async function openDeleteDialog(title: string) {
      await renderWithProviders(<ChatHistory />, {
        loggedIn: true,
        chats: CHATS,
      });
      const row = screen.getByRole("link", { name: title }).closest("li")!;
      fireEvent.click(
        within(row).getByRole("button", { name: "Chat options" }),
      );
      fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
      return screen.getByRole("dialog", { name: "Delete chat?" });
    }

    function titles() {
      return screen.getAllByRole("link").map((link) => link.textContent);
    }

    it("asks for confirmation", async () => {
      const dialog = await openDeleteDialog("Recipes");

      expect(dialog.textContent).toContain(
        "\u201cRecipes\u201d will be permanently deleted.",
      );
    });

    it("keeps the chat when cancelled", async () => {
      const deleted = mockDelete();
      const dialog = await openDeleteDialog("Recipes");

      fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(titles()).toEqual(["Recipes", "Travel plans"]);
      expect(deleted).toEqual([]);
    });

    it("removes the chat when confirmed", async () => {
      const deleted = mockDelete();
      const dialog = await openDeleteDialog("Recipes");

      fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

      await waitFor(() => expect(titles()).toEqual(["Travel plans"]));
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(deleted).toEqual(["a"]);
      expect(router.push).not.toHaveBeenCalled();
    });

    it("starts a new chat when deleting the open one", async () => {
      mockDelete();
      navigate("/chat/b");
      const dialog = await openDeleteDialog("Travel plans");

      fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

      await waitFor(() => expect(router.push).toHaveBeenCalledWith("/new"));
      expect(titles()).toEqual(["Recipes"]);
    });

    it("keeps the dialog open when deleting fails", async () => {
      mockDelete(500);
      const dialog = await openDeleteDialog("Recipes");

      fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

      expect(
        await within(dialog).findByText(
          "Couldn't delete the chat. Please try again.",
        ),
      ).toBeTruthy();
      expect(titles()).toEqual(["Recipes", "Travel plans"]);
    });
  });
});
