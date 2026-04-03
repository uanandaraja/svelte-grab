import type { EditorLinkBuilder, SvelteSourceInfo } from "../types.js";

const createFileSpecifier = (source: SvelteSourceInfo): string | null => {
  if (!source.filePath) {
    return null;
  }

  const lineNumber = source.lineNumber ?? 1;
  const columnNumber = source.columnNumber ?? 1;

  return `${source.filePath}:${lineNumber}:${columnNumber}`;
};

const tryOpenWithDevServer = async (
  source: SvelteSourceInfo,
): Promise<boolean> => {
  const file = createFileSpecifier(source);
  if (!file) {
    return false;
  }

  const url = new URL("/__open-in-editor", window.location.origin);
  url.searchParams.set("file", file);

  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "same-origin",
  });

  return response.ok;
};

const tryOpenWithProtocolLink = (
  source: SvelteSourceInfo,
  editorLinkBuilder?: EditorLinkBuilder,
): boolean => {
  if (!source.filePath) {
    return false;
  }

  const defaultUrl = `vscode://file/${source.filePath}:${source.lineNumber ?? 1}:${source.columnNumber ?? 1}`;
  const protocolUrl =
    editorLinkBuilder?.(
      source.filePath,
      source.lineNumber,
      source.columnNumber,
    ) ?? defaultUrl;

  if (!protocolUrl) {
    return false;
  }

  window.open(protocolUrl, "_blank", "noopener,noreferrer");
  return true;
};

export const openSourceInEditor = async (
  source: SvelteSourceInfo | null,
  editorLinkBuilder?: EditorLinkBuilder,
): Promise<boolean> => {
  if (!source?.filePath) {
    return false;
  }

  const openedByDevServer = await tryOpenWithDevServer(source).catch(
    () => false,
  );
  if (openedByDevServer) {
    return true;
  }

  return tryOpenWithProtocolLink(source, editorLinkBuilder);
};
