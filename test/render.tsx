import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { ReactNode } from "react";
import { expect } from "vitest";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChatHistoryProvider } from "@/contexts/ChatHistoryContext";
import { GuestChatProvider } from "@/contexts/GuestChatContext";
import { ModelProvider } from "@/contexts/ModelContext";
import type { ChatSummary } from "@/lib/db/models/Chat";
import { server } from "@/test/msw";

export const USER = {
  id: "user-1",
  email: "jane@acme.com",
  firstName: "Jane",
  lastName: "Smith",
};

export function mockSession(loggedIn: boolean) {
  server.use(
    http.get("*/api/auth/me", () =>
      loggedIn
        ? HttpResponse.json(USER)
        : HttpResponse.json({ error: "Unauthorized" }, { status: 401 }),
    ),
  );
}

export function mockChatReply(text: string, chatId?: string) {
  server.use(
    http.post(
      "*/api/chat",
      () =>
        new HttpResponse(text, {
          headers: chatId ? { "X-Chat-Id": chatId } : {},
        }),
    ),
  );
}

export function mockStreamingChatReply(firstChunk: string, chatId?: string) {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array> | undefined;

  server.use(
    http.post(
      "*/api/chat",
      () =>
        new HttpResponse(
          new ReadableStream({
            start(c) {
              controller = c;
              c.enqueue(encoder.encode(firstChunk));
            },
          }),
          { headers: chatId ? { "X-Chat-Id": chatId } : {} },
        ),
    ),
  );

  return {
    finish: async (rest: string) => {
      await act(async () => {
        controller?.enqueue(encoder.encode(rest));
        controller?.close();
      });
    },
  };
}

export async function sendMessage(text: string, expectedReply: string) {
  const textarea = screen.getByPlaceholderText("Write a message...");
  fireEvent.change(textarea, { target: { value: text } });
  fireEvent.keyDown(textarea, { key: "Enter" });
  await screen.findByText(expectedReply);
}

function WhenAuthSettled({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();
  return isLoading ? null : children;
}

interface RenderOptions {
  loggedIn: boolean;
  chats?: ChatSummary[];
}

export async function renderWithProviders(
  ui: ReactNode,
  { loggedIn, chats = [] }: RenderOptions,
) {
  mockSession(loggedIn);

  const result = render(
    <AuthProvider>
      <ModelProvider>
        <ChatHistoryProvider initialChats={chats}>
          <GuestChatProvider>
            <WhenAuthSettled>{ui}</WhenAuthSettled>
          </GuestChatProvider>
        </ChatHistoryProvider>
      </ModelProvider>
    </AuthProvider>,
  );

  await waitFor(() => expect(result.container.firstChild).not.toBeNull());

  return result;
}
