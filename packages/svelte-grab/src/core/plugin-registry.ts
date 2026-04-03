import type {
  GrabAction,
  InitOptions,
  SelectionContext,
  SvelteSourceInfo,
} from "../types.js";

const DEFAULT_ACTIONS: readonly GrabAction[] = [];

export const createPluginRegistry = (options: InitOptions) => {
  return {
    actions: options.actions ?? DEFAULT_ACTIONS,
    transformSnippet(html: string, context: SelectionContext): string {
      return options.transformSnippet ? options.transformSnippet(html, context) : html;
    },
    resolveSource(element: Element): SvelteSourceInfo | null {
      return options.resolveSource ? options.resolveSource(element) : null;
    },
  };
};
