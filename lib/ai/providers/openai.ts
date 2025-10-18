import { BaseProvider, Message } from "@/lib/ai/core/base-provider";

class OpenAIProvider extends BaseProvider {
  public async chat(
    model: string = "gpt-4.1",
    messages: Message[] = [],
    stream: boolean = false,
  ): Promise<ReadableStream> {
    return await super.chat(model, messages, stream);
  }

  protected getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}` };
  }

  protected getBaseURL(): string {
    return "https://api.openai.com/v1";
  }
}

export const openai = new OpenAIProvider();
