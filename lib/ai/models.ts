export interface Model {
  model: string;
  name: string;
  provider: string;
}

export const models: Model[] = [
  {
    model: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
  },
  {
    model: "o4-mini",
    name: "o4-mini",
    provider: "OpenAI",
  },
  {
    model: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
  },
  {
    model: "claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
  },
  {
    model: "claude-opus",
    name: "Claude Opus 4",
    provider: "Anthropic",
  },
  {
    model: "mistral-large-latest",
    name: "Mistral",
    provider: "Mistral",
  },
];
