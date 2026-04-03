import type { SvelteSourceInfo } from "../../types.js";

const formatLocation = (
  filePath: string | null,
  lineNumber: number | null,
  columnNumber: number | null,
): string => {
  if (!filePath) {
    return "unknown";
  }

  if (lineNumber === null) {
    return filePath;
  }

  if (columnNumber === null) {
    return `${filePath}:${lineNumber}`;
  }

  return `${filePath}:${lineNumber}:${columnNumber}`;
};

export const formatStackContext = (source: SvelteSourceInfo | null): string => {
  if (!source?.filePath) {
    return "";
  }

  const lines = [
    formatLocation(source.filePath, source.lineNumber, source.columnNumber),
    ...source.stack.map((frame) => {
      const location = formatLocation(frame.file, frame.line, frame.column);
      return `in ${frame.displayName} (${location})`;
    }),
  ];

  return lines.join("\n");
};
