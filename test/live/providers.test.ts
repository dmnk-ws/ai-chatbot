import { describe, expect, it } from "vitest";

import { getProvider } from "@/lib/ai/core/provider-registry";
import { models } from "@/lib/ai/models";
import { Provider, type ProviderName } from "@/lib/ai/types";
import { readText } from "@/test/msw";

const envKeys: Record<ProviderName, string> = {
  [Provider.ANTHROPIC]: "ANTHROPIC_API_KEY",
  [Provider.OPENAI]: "OPENAI_API_KEY",
  [Provider.MISTRAL]: "MISTRAL_API_KEY",
  [Provider.XAI]: "XAI_API_KEY",
};

describe.runIf(process.env.LIVE)("live providers", () => {
  describe.each(models)("$provider $model", ({ provider, model }) => {
    const envKey = envKeys[provider as ProviderName];

    it.skipIf(!process.env[envKey])(
      "replies with text",
      async () => {
        const stream = await getProvider(provider as ProviderName).chat(
          model,
          [{ role: "user", content: "Reply with the single word: pong" }],
          true,
        );

        expect((await readText(stream)).trim()).not.toBe("");
      },
      30_000,
    );
  });
});
