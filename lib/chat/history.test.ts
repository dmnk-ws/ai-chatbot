import { describe, expect, it } from "vitest";

import { mergeConsecutiveUserMessages } from "@/lib/chat/history";

describe("mergeConsecutiveUserMessages", () => {
  it("merges user messages that follow each other", () => {
    expect(
      mergeConsecutiveUserMessages([
        { role: "user", content: "ping" },
        { role: "assistant", content: "pong" },
        { role: "user", content: "one" },
        { role: "user", content: "two" },
        { role: "user", content: "three" },
      ]),
    ).toEqual([
      { role: "user", content: "ping" },
      { role: "assistant", content: "pong" },
      { role: "user", content: "one\n\ntwo\n\nthree" },
    ]);
  });

  it("keeps alternating turns unchanged", () => {
    const messages = [
      { role: "user", content: "ping" },
      { role: "assistant", content: "pong" },
      { role: "user", content: "again" },
    ] as const;

    expect(mergeConsecutiveUserMessages([...messages])).toEqual(messages);
  });
});
