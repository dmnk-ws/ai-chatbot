import { BaseProvider } from "@/lib/ai/core/base-provider";
import type { Message } from "@/lib/ai/types";

export class GrokProvider extends BaseProvider {
  protected getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${process.env.XAI_API_KEY || ""}` };
  }

  protected getBaseURL(): string {
    return "https://api.x.ai";
  }

  protected getEndpoint(): string {
    return "/v1/responses";
  }

  protected buildBody(
    model: string,
    messages: Message[],
    stream: boolean,
  ): object {
    return { model, input: messages, stream, store: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected parseChunk(data: any): string {
    return data.type === "response.output_text.delta" ? data.delta || "" : "";
  }
}
