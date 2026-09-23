import { describe, expect, it } from "vitest";

import {
  UnknownProviderError,
  getProvider,
} from "@/lib/ai/core/provider-registry";
import { AnthropicProvider } from "@/lib/ai/providers/anthropic";
import { GrokProvider } from "@/lib/ai/providers/grok";
import { MistralProvider } from "@/lib/ai/providers/mistral";
import { OpenAIProvider } from "@/lib/ai/providers/openai";
import { Provider, type ProviderName } from "@/lib/ai/types";

describe("getProvider", () => {
  it.each([
    [Provider.ANTHROPIC, AnthropicProvider],
    [Provider.OPENAI, OpenAIProvider],
    [Provider.MISTRAL, MistralProvider],
    [Provider.XAI, GrokProvider],
  ])("returns a cached %s provider", (name, providerClass) => {
    const provider = getProvider(name);

    expect(provider).toBeInstanceOf(providerClass);
    expect(getProvider(name)).toBe(provider);
  });

  it("throws UnknownProviderError for unknown names", () => {
    expect(() => getProvider("Nope" as ProviderName)).toThrow(
      UnknownProviderError,
    );
  });
});
