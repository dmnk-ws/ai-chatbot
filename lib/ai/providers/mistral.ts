import { BaseProvider, Message } from "@/lib/ai/core/base-provider";

class MistralProvider extends BaseProvider {
  public async chat(
    model: string = "mistral-large-latest",
    messages: Message[] = [],
    stream: boolean = false,
  ): Promise<ReadableStream> {
    return await super.chat(model, messages, stream);
  }

  protected getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${process.env.MISTRAL_API_KEY || ""}` };
  }

  protected getBaseURL(): string {
    return "https://api.mistral.ai/v1";
  }
}

export const mistral = new MistralProvider();
