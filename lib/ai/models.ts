import { Model, Provider } from "@/lib/ai/types";

export const models: Model[] = [
  {
    model: "mistral-large-latest",
    name: "Mistral",
    provider: Provider.MISTRAL,
  },
  {
    model: "gpt-4.1",
    name: "GPT-4.1",
    provider: Provider.OPENAI,
  },
  {
    model: "o4-mini",
    name: "o4-mini",
    provider: Provider.OPENAI,
  },
  {
    model: "gpt-5",
    name: "GPT-5",
    provider: Provider.OPENAI,
  },
  {
    model: "claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: Provider.ANTHROPIC,
  },
  {
    model: "claude-opus",
    name: "Claude Opus 4",
    provider: Provider.ANTHROPIC,
  },
  {
    model: "grok-4-1-fast",
    name: "Grok 4",
    provider: Provider.XAI,
  },
];
