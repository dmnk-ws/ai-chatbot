const MAX_TITLE_LENGTH = 50;

export function chatTitle(text: string): string {
  const title = text.trim().replace(/\s+/g, " ");
  if (title.length <= MAX_TITLE_LENGTH) return title || "New chat";
  return `${title.slice(0, MAX_TITLE_LENGTH).trimEnd()}...`;
}
