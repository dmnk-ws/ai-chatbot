interface StreamHandlers {
  onComplete: (text: string) => Promise<void>;
  onCancel: (text: string) => Promise<void>;
}

async function runSafely(
  handler: (text: string) => Promise<void>,
  text: string,
) {
  try {
    await handler(text);
  } catch (error) {
    console.error(error);
  }
}

export function observeStream(
  source: ReadableStream<Uint8Array>,
  { onComplete, onCancel }: StreamHandlers,
): ReadableStream<Uint8Array> {
  const reader = source.getReader();
  const decoder = new TextDecoder();
  let text = "";

  return new ReadableStream({
    async pull(controller) {
      let result: ReadableStreamReadResult<Uint8Array>;
      try {
        result = await reader.read();
      } catch (error) {
        controller.error(error);
        return;
      }

      if (result.done) {
        await runSafely(onComplete, text + decoder.decode());
        controller.close();
        return;
      }

      text += decoder.decode(result.value, { stream: true });
      controller.enqueue(result.value);
    },
    async cancel(reason) {
      await reader.cancel(reason);
      await runSafely(onCancel, text + decoder.decode());
    },
  });
}
