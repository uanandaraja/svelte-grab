import { copySelection } from "./clipboard.js";
import { openSourceInEditor } from "./editor.js";
import { createPluginRegistry } from "./plugin-registry.js";
import { resolveSvelteSource } from "../source/svelte/resolve-source.js";
import { formatStackContext } from "../source/svelte/format-stack.js";
import { createOverlay, overlayIgnoreAttr } from "../ui/overlay.js";
import type { InitOptions, SelectionContext, SvelteGrabApi, SvelteSourceInfo } from "../types.js";

const DEFAULT_ACTIVATION_KEY = "G";
let hasInited = false;

const isIgnoredElement = (element: Element | null): boolean => {
  if (!element) {
    return true;
  }

  if (element.closest(`[${overlayIgnoreAttr}="true"]`)) {
    return true;
  }

  return ["HTML", "BODY", "SCRIPT", "STYLE"].includes(element.tagName);
};

const activationMatches = (event: KeyboardEvent, activationKey: string): boolean =>
  event.altKey && event.shiftKey && event.code === `Key${activationKey.toUpperCase()}`;

const getSelectionContext = (
  element: Element,
  resolveSource: (element: Element) => SvelteSourceInfo | null,
): SelectionContext => ({
  element,
  source: resolveSource(element),
});

const formatElementLabel = (element: Element): string =>
  `<${element.tagName.toLowerCase()}>`;

export const init = (options: InitOptions = {}): SvelteGrabApi => {
  if (typeof window === "undefined") {
    return {
      copyElement: async () => false,
      destroy() {},
      getSource() {
        return null;
      },
      getStackContext() {
        return "";
      },
      openElement: async () => false,
    };
  }

  if (hasInited) {
    throw new Error("svelte-grab has already been initialized");
  }

  hasInited = true;

  const pluginRegistry = createPluginRegistry(options);
  let active = options.autoActivate ?? false;
  let hoveredElement: Element | null = null;
  let destroyed = false;
  let cursorX = 0;
  let cursorY = 0;
  const overlay = createOverlay({
    onToggle: () => {
      setActive(!active);
    },
  });

  const resolveSource = (element: Element): SvelteSourceInfo | null =>
    pluginRegistry.resolveSource(element) ?? resolveSvelteSource(element);

  const refreshHoveredElement = (): void => {
    const element = document.elementFromPoint(cursorX, cursorY);
    setHoveredElement(element);
  };

  const setActive = (nextActive: boolean): void => {
    active = nextActive;

    if (!active) {
      setHoveredElement(null);
      return;
    }

    refreshHoveredElement();
  };

  const updateOverlay = (): void => {
    const context = hoveredElement ? getSelectionContext(hoveredElement, resolveSource) : null;
    const message = context?.source
      ? [
          `<${context.element.tagName.toLowerCase()}>`,
          context.source.componentName
            ? `component: ${context.source.componentName}`
            : "component: unknown",
          context.source.filePath
            ? `${context.source.filePath}:${context.source.lineNumber ?? "?"}:${context.source.columnNumber ?? "?"}`
            : "source: unavailable",
        ].join("\n")
      : "hover a Svelte element";

    overlay.update({
      active,
      message,
      rect: hoveredElement?.getBoundingClientRect() ?? null,
      visible: active && Boolean(hoveredElement),
      x: cursorX,
      y: cursorY,
    });
  };

  const setHoveredElement = (element: Element | null): void => {
    hoveredElement = isIgnoredElement(element) ? null : element;
    updateOverlay();
  };

  const copyElement = async (element: Element | null = hoveredElement): Promise<boolean> => {
    if (!element) {
      overlay.flash("Nothing selected to copy", { tone: "error" });
      return false;
    }

    const context = getSelectionContext(element, resolveSource);
    const rawHtml = element.outerHTML;
    const html = pluginRegistry.transformSnippet(rawHtml, context);
    const didCopy = await copySelection(html, context).catch(() => false);
    const rect = context.element.getBoundingClientRect();

    if (didCopy) {
      overlay.flash(`Copied ${formatElementLabel(context.element)}`, { rect });
      options.onSelect?.(context);
    } else {
      overlay.flash(`Copy failed for ${formatElementLabel(context.element)}`, {
        rect,
        tone: "error",
      });
    }

    return didCopy;
  };

  const openElement = async (
    element: Element | null = hoveredElement,
  ): Promise<boolean> => {
    if (!element) {
      overlay.flash("Nothing selected to open", { tone: "error" });
      return false;
    }

    const opened = await openSourceInEditor(
      resolveSource(element),
      options.editorLinkBuilder,
    );
    const rect = element.getBoundingClientRect();

    if (opened) {
      overlay.flash(`Opening ${formatElementLabel(element)}`, { rect });
    } else {
      overlay.flash(`Open failed for ${formatElementLabel(element)}`, {
        rect,
        tone: "error",
      });
    }

    return opened;
  };

  const onPointerMove = (event: PointerEvent): void => {
    cursorX = event.clientX;
    cursorY = event.clientY;

    if (!active) {
      updateOverlay();
      return;
    }

    const element = document.elementFromPoint(event.clientX, event.clientY);
    setHoveredElement(element);
  };

  const onClick = (event: MouseEvent): void => {
    if (!active || !hoveredElement) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    if (isIgnoredElement(target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    void copyElement(hoveredElement);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (activationMatches(event, options.activationKey ?? DEFAULT_ACTIVATION_KEY)) {
      setActive(!active);
      event.preventDefault();
      return;
    }

    if (!active) {
      return;
    }

    switch (event.key) {
      case "Escape": {
        active = false;
        setHoveredElement(null);
        event.preventDefault();
        break;
      }
      case "Enter": {
        event.preventDefault();
        void copyElement();
        break;
      }
      case "o":
      case "O": {
        event.preventDefault();
        void openElement();
        break;
      }
    }
  };

  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("click", onClick, true);
  window.addEventListener("keydown", onKeyDown, true);
  overlay.markIgnored(document.body.lastElementChild ?? document.body);
  updateOverlay();

  return {
    async copyElement(element?: Element | null) {
      return copyElement(element ?? hoveredElement);
    },
    destroy() {
      if (destroyed) {
        return;
      }

      destroyed = true;
      hasInited = false;
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKeyDown, true);
      overlay.destroy();
    },
    getSource(element: Element) {
      return resolveSource(element);
    },
    getStackContext(element: Element) {
      return formatStackContext(resolveSource(element));
    },
    async openElement(element?: Element | null) {
      return openElement(element ?? hoveredElement);
    },
  };
};
