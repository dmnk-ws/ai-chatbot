import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

export const server = setupServer();

export interface RecordedCall {
  url: string;
  headers: Headers;
  body: unknown;
}

type SseEvent = string | object;

export function sseStream(
  events: SseEvent[],
  { chunkSize }: { chunkSize?: number } = {},
): ReadableStream<Uint8Array> {
  const text = events
    .map((event) =>
      typeof event === "string"
        ? `${event}\n`
        : `data: ${JSON.stringify(event)}\n\n`,
    )
    .join("");
  const bytes = new TextEncoder().encode(text);
  const size = chunkSize ?? bytes.length;

  return new ReadableStream({
    start(controller) {
      for (let i = 0; i < bytes.length; i += size) {
        controller.enqueue(bytes.slice(i, i + size));
      }
      controller.close();
    },
  });
}

export function mockSse(
  url: string,
  events: SseEvent[],
  opts?: { chunkSize?: number },
): RecordedCall[] {
  const calls: RecordedCall[] = [];

  server.use(
    http.post(url, async ({ request }) => {
      calls.push({
        url: request.url,
        headers: request.headers,
        body: await request.json(),
      });

      return new HttpResponse(sseStream(events, opts), {
        headers: { "Content-Type": "text/event-stream" },
      });
    }),
  );

  return calls;
}

export function mockError(url: string, status: number, body: object) {
  server.use(http.post(url, () => HttpResponse.json(body, { status })));
}

export async function readText(stream: ReadableStream): Promise<string> {
  let text = "";
  const decoder = new TextDecoder();

  for await (const chunk of stream) {
    text += decoder.decode(chunk, { stream: true });
  }

  return text;
}
