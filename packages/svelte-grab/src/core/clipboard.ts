import { formatStackContext } from "../source/svelte/format-stack.js";
import type { ClipboardMetadata, SelectionContext } from "../types.js";

const JSON_MIME = "application/x-svelte-grab+json";

const createPlainText = (
  html: string,
  context: SelectionContext,
): string => {
  const stack = formatStackContext(context.source);
  return stack ? `${html}\n\n${stack}` : html;
};

const createClipboardMetadata = (
  context: SelectionContext,
): ClipboardMetadata => ({
  stack: context.source?.stack ?? [],
  source: {
    filePath: context.source?.filePath ?? null,
    lineNumber: context.source?.lineNumber ?? null,
    columnNumber: context.source?.columnNumber ?? null,
  },
  tagName: context.element.tagName.toLowerCase(),
});

const writeStructuredClipboard = async (
  html: string,
  plainText: string,
  metadata: ClipboardMetadata,
): Promise<boolean> => {
  if (!("ClipboardItem" in window) || !navigator.clipboard?.write) {
    return false;
  }

  const attempts = [
    new ClipboardItem({
      "text/plain": new Blob([plainText], { type: "text/plain" }),
      "text/html": new Blob([html], { type: "text/html" }),
      [JSON_MIME]: new Blob([JSON.stringify(metadata, null, 2)], {
        type: JSON_MIME,
      }),
    }),
    new ClipboardItem({
      "text/plain": new Blob([plainText], { type: "text/plain" }),
      "text/html": new Blob([html], { type: "text/html" }),
    }),
  ];

  for (const clipboardItem of attempts) {
    try {
      await navigator.clipboard.write([clipboardItem]);
      return true;
    } catch {}
  }

  return false;
};

export const copySelection = async (
  html: string,
  context: SelectionContext,
): Promise<boolean> => {
  const plainText = createPlainText(html, context);
  const metadata = createClipboardMetadata(context);

  if (await writeStructuredClipboard(html, plainText, metadata)) {
    return true;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(plainText);
    return true;
  }

  return false;
};
