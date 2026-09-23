import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

import { clearGuestChat } from "@/lib/chat/guest-chat-storage";
import { resetRouter } from "@/test/navigation";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  clearGuestChat();
  resetRouter();
});
