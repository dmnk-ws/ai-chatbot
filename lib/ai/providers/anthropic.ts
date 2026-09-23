import { BaseProvider } from "@/lib/ai/core/base-provider";
import type { Message } from "@/lib/ai/types";

export class AnthropicProvider extends BaseProvider {
  protected getAuthHeaders(): Record<string, string> {
    return {
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    };
  }

  protected getBaseURL(): string {
    return "https://api.anthropic.com/v1";
  }

  protected getEndpoint(): string {
    return "/messages";
  }

  protected buildBody(
    model: string,
    messages: Message[],
    stream: boolean,
  ): object {
    return { ...super.buildBody(model, messages, stream), max_tokens: 1000 };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected parseChunk(data: any): string {
    return data.type === "content_block_delta" ? data.delta?.text || "" : "";
  }
}
