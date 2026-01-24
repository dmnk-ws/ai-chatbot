import { BaseProvider } from "@/lib/ai/core/base-provider";

export class MistralProvider extends BaseProvider {
  protected getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${process.env.MISTRAL_API_KEY || ""}` };
  }

  protected getBaseURL(): string {
    return "https://api.mistral.ai/v1";
  }
}
