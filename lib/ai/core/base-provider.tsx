export interface Message {
  role: string;
  content: string;
}

export interface ProviderConfig {
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export abstract class BaseProvider {
  protected baseUrl?: string;
  protected apiKey?: string;
  protected headers?: Record<string, string>;

  constructor({ baseUrl, apiKey, headers }: ProviderConfig = {}) {
    this.baseUrl = baseUrl || this.getBaseURL();
    this.apiKey = apiKey;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.getAuthHeaders(),
      ...headers,
    };
  }

  public abstract chatStream(
    model: string,
    messages: Message[],
  ): Promise<ReadableStream>;

  protected abstract getBaseURL(): string;
  protected abstract getAuthHeaders(): Record<string, string>;
}
