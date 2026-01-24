export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ProviderConfig {
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface Model {
  model: string;
  name: string;
  provider: string;
}

export enum Provider {
  ANTHROPIC = "Anthropic",
  OPENAI = "OpenAI",
  MISTRAL = "Mistral",
}

export type ProviderName =
  | Provider.ANTHROPIC
  | Provider.OPENAI
  | Provider.MISTRAL;
