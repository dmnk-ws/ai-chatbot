import { BaseProvider } from "@/lib/ai/core/base-provider";
import { AnthropicProvider } from "@/lib/ai/providers/anthropic";
import { GrokProvider } from "@/lib/ai/providers/grok";
import { MistralProvider } from "@/lib/ai/providers/mistral";
import { OpenAIProvider } from "@/lib/ai/providers/openai";
import { Provider, ProviderName } from "@/lib/ai/types";

const providerCache = new Map<ProviderName, BaseProvider>();

function createProvider(name: ProviderName): BaseProvider {
  switch (name) {
    case Provider.ANTHROPIC:
      return new AnthropicProvider({
        headers: { "anthropic-version": "2023-06-01" },
      });
    case Provider.OPENAI:
      return new OpenAIProvider();
    case Provider.MISTRAL:
      return new MistralProvider();
    case Provider.XAI:
      return new GrokProvider();
  }
}

export function getProvider(name: ProviderName): BaseProvider {
  if (!providerCache.has(name)) {
    providerCache.set(name, createProvider(name));
  }

  return providerCache.get(name)!;
}
