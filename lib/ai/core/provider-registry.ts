import { BaseProvider } from "@/lib/ai/core/base-provider";
import { AnthropicProvider } from "@/lib/ai/providers/anthropic";
import { GrokProvider } from "@/lib/ai/providers/grok";
import { MistralProvider } from "@/lib/ai/providers/mistral";
import { OpenAIProvider } from "@/lib/ai/providers/openai";
import { Provider, ProviderName } from "@/lib/ai/types";

export class UnknownProviderError extends Error {
  constructor(name: string) {
    super(`Provider ${name} not found`);
  }
}

const providerCache = new Map<ProviderName, BaseProvider>();

function createProvider(name: ProviderName): BaseProvider {
  switch (name) {
    case Provider.ANTHROPIC:
      return new AnthropicProvider();
    case Provider.OPENAI:
      return new OpenAIProvider();
    case Provider.MISTRAL:
      return new MistralProvider();
    case Provider.XAI:
      return new GrokProvider();
    default:
      throw new UnknownProviderError(name);
  }
}

export function getProvider(name: ProviderName): BaseProvider {
  if (!providerCache.has(name)) {
    providerCache.set(name, createProvider(name));
  }

  return providerCache.get(name)!;
}
