export interface Message {
  role: "user" | "assistant";
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

  public async chat(
    model: string,
    messages: Message[],
    stream?: boolean,
  ): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      body: JSON.stringify({ model, messages, stream }),
      headers: this.headers,
    }).catch((e) => console.error("An error occurred", e));

    if (!response || !response.ok || !response.body)
      throw new Error("Fetching error");

    return this.pipe(response.body);
  }

  protected abstract getBaseURL(): string;

  protected abstract getAuthHeaders(): Record<string, string>;

  protected pipe(response: ReadableStream): ReadableStream {
    return response
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            const lines = chunk.split("\n");

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
}
