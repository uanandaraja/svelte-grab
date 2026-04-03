import type {
  SvelteMeta,
  SvelteMetaStackEntry,
  SvelteMetaStackFrameType,
  SvelteSourceFrame,
  SvelteSourceInfo,
} from "../../types.js";

const NORMALIZED_FRAME_TYPES = new Set([
  "component",
  "if",
  "each",
  "await",
  "key",
  "render",
]);

const toFrameType = (type: string | undefined): SvelteMetaStackFrameType => {
  if (!type || !NORMALIZED_FRAME_TYPES.has(type)) {
    return "unknown";
  }

  switch (type) {
    case "component":
    case "if":
    case "each":
    case "await":
    case "key":
    case "render":
      return type;
    default:
      return "unknown";
  }
};

const normalizeColumn = (column: number | undefined): number | null => {
  if (typeof column !== "number") {
    return null;
  }

  return column + 1;
};

const getDisplayName = (entry: SvelteMetaStackEntry): string => {
  switch (entry.type) {
    case "component":
      return entry.componentTag ?? "component";
    case "if":
    case "each":
    case "await":
    case "key":
    case "render":
      return entry.type;
    default:
      return "frame";
  }
};

const toFrame = (entry: SvelteMetaStackEntry): SvelteSourceFrame => ({
  type: toFrameType(entry.type),
  file: entry.file ?? null,
  line: entry.line ?? null,
  column: normalizeColumn(entry.column),
  componentName: entry.componentTag ?? null,
  displayName: getDisplayName(entry),
});

const getNearestMetaElement = (node: Node | null): Element | null => {
  let current: Node | null = node;

  while (current) {
    if (current instanceof Element) {
      const meta = current.__svelte_meta;
      if (meta?.loc?.file) {
        return current;
      }
    }

    current = current.parentNode;
  }

  return null;
};

const getStack = (meta: SvelteMeta | null | undefined): SvelteSourceFrame[] => {
  const frames: SvelteSourceFrame[] = [];
  let current = meta?.parent ?? null;

  while (current) {
    frames.push(toFrame(current));
    current = current.parent ?? null;
  }

  return frames;
};

export const resolveSvelteSource = (
  element: Element,
): SvelteSourceInfo | null => {
  const resolvedElement = getNearestMetaElement(element);
  if (!resolvedElement) {
    return null;
  }

  const meta = resolvedElement.__svelte_meta;
  if (!meta?.loc?.file) {
    return null;
  }

  const stack = getStack(meta);
  const componentFrame = stack.find((frame) => frame.componentName);

  return {
    componentName: componentFrame?.componentName ?? null,
    filePath: meta.loc.file ?? null,
    lineNumber: meta.loc.line ?? null,
    columnNumber: normalizeColumn(meta.loc.column),
    stack,
    targetElement: resolvedElement,
  };
};
