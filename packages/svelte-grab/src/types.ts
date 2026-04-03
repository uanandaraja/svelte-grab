export type SvelteMetaStackFrameType =
  | "component"
  | "if"
  | "each"
  | "await"
  | "key"
  | "render"
  | "unknown";

export type SvelteMetaStackEntry = {
  type?: string;
  file?: string;
  line?: number;
  column?: number;
  parent?: SvelteMetaStackEntry | null;
  componentTag?: string;
};

export type SvelteMeta = {
  loc?: {
    file?: string;
    line?: number;
    column?: number;
  };
  parent?: SvelteMetaStackEntry | null;
};

export type SvelteSourceFrame = {
  type: SvelteMetaStackFrameType;
  file: string | null;
  line: number | null;
  column: number | null;
  componentName: string | null;
  displayName: string;
};

export type SvelteSourceInfo = {
  componentName: string | null;
  filePath: string | null;
  lineNumber: number | null;
  columnNumber: number | null;
  stack: SvelteSourceFrame[];
  targetElement: Element | null;
};

export type ClipboardMetadata = {
  stack: SvelteSourceFrame[];
  source: {
    filePath: string | null;
    lineNumber: number | null;
    columnNumber: number | null;
  };
  tagName: string;
};

export type EditorLinkBuilder = (
  filePath: string,
  lineNumber: number | null,
  columnNumber: number | null,
) => string | null;

export type GrabAction = {
  id: string;
  label: string;
  run: (context: SelectionContext) => void | Promise<void>;
};

export type SelectionContext = {
  element: Element;
  source: SvelteSourceInfo | null;
};

export type InitOptions = {
  activationKey?: string;
  autoActivate?: boolean;
  overlayLabel?: boolean;
  onSelect?: (context: SelectionContext) => void;
  transformSnippet?: (html: string, context: SelectionContext) => string;
  actions?: readonly GrabAction[];
  resolveSource?: (element: Element) => SvelteSourceInfo | null;
  editorLinkBuilder?: EditorLinkBuilder;
};

export type SvelteGrabApi = {
  copyElement: (element?: Element | null) => Promise<boolean>;
  destroy: () => void;
  getSource: (element: Element) => SvelteSourceInfo | null;
  getStackContext: (element: Element) => string;
  openElement: (element?: Element | null) => Promise<boolean>;
};

declare global {
  interface Element {
    __svelte_meta?: SvelteMeta | null;
  }
}
