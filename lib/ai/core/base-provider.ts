import type { Message, ProviderConfig } from "@/lib/ai/types";

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
    stream: boolean = false,
  ): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}${this.getEndpoint()}`, {
      method: "POST",
      body: JSON.stringify(this.buildBody(model, messages, stream)),
      headers: this.headers,
    });

    if (!response.ok || !response.body) {
      throw new Error(
        `${this.constructor.name} ${response.status}: ${await response.text()}`,
      );
    }

    return this.pipe(response.body);
  }

  protected abstract getBaseURL(): string;

  protected abstract getAuthHeaders(): Record<string, string>;

  protected getEndpoint(): string {
    return "/chat/completions";
  }

  protected buildBody(
    model: string,
    messages: Message[],
    stream: boolean,
  ): object {
    return { model, messages, stream };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected parseChunk(data: any): string {
    return data.choices?.[0]?.delta?.content || "";
  }

  protected pipe(response: ReadableStream): ReadableStream {
    let buffer = "";
    const parse = this.parseChunk.bind(this);

    return response
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
                  const content = parse(JSON.parse(data));

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
