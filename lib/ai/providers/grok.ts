import { BaseProvider } from "@/lib/ai/core/base-provider";
import type { Message } from "@/lib/ai/types";

export class GrokProvider extends BaseProvider {
  public async chat(
    model: string = "grok-4.20-reasoning",
    messages: Message[] = [],
    stream: boolean = false,
  ): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/v1/responses`, {
      method: "POST",
      body: JSON.stringify({
        model,
        input: messages,
        stream,
        store: false,
      }),
      headers: this.headers,
    }).catch((e) => console.error("An error occurred", e));

    if (!response || !response.ok || !response.body)
      throw new Error("Fetching error");

    return this.pipe(response.body);
  }

  protected getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${process.env.XAI_API_KEY || ""}` };
  }

  protected getBaseURL(): string {
    return "https://api.x.ai";
  }
}
