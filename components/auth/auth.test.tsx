import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Auth from "@/components/auth/auth";
import { AuthType } from "@/components/auth/types";
import { AuthProvider } from "@/contexts/AuthContext";
import { loadGuestChat, saveGuestChat } from "@/lib/chat/guest-chat-storage";
import { server } from "@/test/msw";
import { router } from "@/test/navigation";
import { USER, mockSession } from "@/test/render";

vi.mock("next/navigation", () => import("@/test/navigation"));

function submitSignIn() {
  fireEvent.change(screen.getByLabelText("Email Address"), {
    target: { value: USER.email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "secret" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
}

function renderSignIn() {
  render(
    <AuthProvider>
      <Auth mode={AuthType.SIGN_IN} />
    </AuthProvider>,
  );
}

async function signIn() {
  renderSignIn();
  submitSignIn();
  await waitFor(() => expect(router.push).toHaveBeenCalled());
}

function failGuestChatImport() {
  server.use(
    http.post(
      "*/api/chats",
      () => HttpResponse.json({ error: "Failed" }, { status: 500 }),
      { once: true },
    ),
  );
}

const IMPORT_ERROR = "Signed in, but your chat couldn't be saved. Try again.";

describe("Auth sign in", () => {
  beforeEach(() => {
    mockSession(false);
    server.use(http.post("*/api/auth/login", () => HttpResponse.json(USER)));
  });

  it("goes to the start page", async () => {
    await signIn();

    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("saves the guest chat and opens it", async () => {
    saveGuestChat([
      { role: "user", content: "ping" },
      { role: "assistant", content: "pong" },
    ]);
    server.use(
      http.post("*/api/chats", () =>
        HttpResponse.json({ id: "chat-1", title: "ping" }, { status: 201 }),
      ),
    );

    await signIn();

    expect(router.push).toHaveBeenCalledWith("/chat/chat-1");
  });

  it("stays on the form and retries when saving the guest chat fails", async () => {
    saveGuestChat([{ role: "user", content: "ping" }]);
    server.use(
      http.post("*/api/chats", () =>
        HttpResponse.json({ id: "chat-1", title: "ping" }, { status: 201 }),
      ),
    );
    failGuestChatImport();
    renderSignIn();

    submitSignIn();
    await screen.findByText(IMPORT_ERROR);
    expect(router.push).not.toHaveBeenCalled();

    submitSignIn();
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith("/chat/chat-1"),
    );
  });

  it("can continue without the guest chat when saving it fails", async () => {
    saveGuestChat([{ role: "user", content: "ping" }]);
    failGuestChatImport();
    renderSignIn();

    submitSignIn();
    await screen.findByText(IMPORT_ERROR);
    fireEvent.click(
      screen.getByRole("button", { name: "Continue without it" }),
    );

    expect(router.push).toHaveBeenCalledWith("/new");
    expect(loadGuestChat()).toEqual([]);
  });
});
