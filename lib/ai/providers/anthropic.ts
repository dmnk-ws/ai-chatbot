import { BaseProvider, Message } from "@/lib/ai/core/base-provider";

class AnthropicProvider extends BaseProvider {
  public async chat(
    model: string = "claude-sonnet-4-5",
    messages: Message[] = [],
    stream: boolean = false,
  ): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      body: JSON.stringify({ max_tokens: 1000, model, messages, stream }),
      headers: this.headers,
    }).catch((e) => console.error("An error occurred", e));

    if (!response || !response.ok || !response.body)
      throw new Error("Fetching error");

    return this.pipe(response.body);
  }

  protected getAuthHeaders(): Record<string, string> {
    return { "x-api-key": process.env.ANTHROPIC_API_KEY || "" };
  }

  protected getBaseURL(): string {
    return "https://api.anthropic.com/v1";
  }
}

export const anthropic = new AnthropicProvider({
  headers: { "anthropic-version": "2023-06-01" },
});
