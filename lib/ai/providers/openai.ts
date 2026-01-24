import { BaseProvider } from "@/lib/ai/core/base-provider";

export class OpenAIProvider extends BaseProvider {
  protected getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}` };
  }

  protected getBaseURL(): string {
    return "https://api.openai.com/v1";
  }
}
