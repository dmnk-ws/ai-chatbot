export function jsonError(
  error: string,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return Response.json({ error }, { status, headers });
}

export function streamResponse(
  stream: ReadableStream,
  headers: Record<string, string> = {},
): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...headers,
    },
  });
}
