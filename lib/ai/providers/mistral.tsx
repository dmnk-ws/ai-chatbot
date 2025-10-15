import { BaseProvider, Message } from "@/lib/ai/core/base-provider";

export class MistralProvider extends BaseProvider {
  public async chatStream(
    model: string = "mistral-large-latest",
    messages: Message[] = [],
  ): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      body: JSON.stringify({ model, messages, stream: true }),
      headers: this.headers,
    }).catch((e) => console.error("An error occurred", e));

    if (!response || !response.ok || !response.body)
      throw new Error("Fetching error");

    let buffer = "";
    return response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            buffer += chunk;
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();

                if (data && data !== "[DONE]") {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || "";

                  if (content) controller.enqueue(content);
                }
              }
            }
          },
        }),
      )
      .pipeThrough(new TextEncoderStream());
  }

  protected getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${process.env.MISTRAL_API_KEY || ""}` };
  }

  protected getBaseURL(): string {
    return "https://api.mistral.ai/v1";
  }
}

export const mistral = new MistralProvider();
