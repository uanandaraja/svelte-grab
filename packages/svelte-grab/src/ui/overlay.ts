type OverlayState = {
  active: boolean;
  message: string;
  rect: DOMRect | null;
  visible: boolean;
  x: number;
  y: number;
};

type OverlayNoticeTone = "error" | "success";

type OverlayFlashOptions = {
  duration?: number;
  rect?: DOMRect | null;
  tone?: OverlayNoticeTone;
};

type OverlayFlashState = {
  message: string;
  rect: DOMRect | null;
  tone: OverlayNoticeTone;
};

type CreateOverlayOptions = {
  onToggle?: () => void;
};

const OVERLAY_ROOT_ID = "svelte-grab-overlay";
const OVERLAY_IGNORE_ATTR = "data-svelte-grab-ignore";
const TOOLBAR_HIDDEN_STORAGE_KEY = "svelte-grab-toolbar-hidden";

const styles = `
#${OVERLAY_ROOT_ID} {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483647;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --svelte-grab-glow-rgb: 15, 118, 110;
  --svelte-grab-frame-inset: 8px;
  --svelte-grab-frame-radius: 20px;
  --svelte-grab-glow-edge: 64px;
}

#${OVERLAY_ROOT_ID} * {
  box-sizing: border-box;
}

@keyframes svelte-grab-frame-pulse {
  0%, 100% {
    opacity: 0.38;
    box-shadow:
      0 0 28px rgba(var(--svelte-grab-glow-rgb), 0.12),
      inset 0 0 24px rgba(var(--svelte-grab-glow-rgb), 0.1);
  }

  50% {
    opacity: 0.6;
    box-shadow:
      0 0 42px rgba(var(--svelte-grab-glow-rgb), 0.16),
      inset 0 0 32px rgba(var(--svelte-grab-glow-rgb), 0.14);
  }
}

@keyframes svelte-grab-frame-glow-pulse {
  0%, 100% {
    opacity: 0.82;
  }

  50% {
    opacity: 1;
  }
}

#${OVERLAY_ROOT_ID} .svelte-grab-frame {
  position: fixed;
  inset: var(--svelte-grab-frame-inset);
  border-radius: var(--svelte-grab-frame-radius);
  background: transparent;
  box-shadow:
    0 0 28px rgba(var(--svelte-grab-glow-rgb), 0.12),
    inset 0 0 22px rgba(var(--svelte-grab-glow-rgb), 0.08);
  filter: blur(8px);
  opacity: 0;
  transition: opacity 120ms ease;
}

#${OVERLAY_ROOT_ID} .svelte-grab-frame-glow {
  position: fixed;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(var(--svelte-grab-glow-rgb), 0.22),
      transparent var(--svelte-grab-glow-edge)
    ),
    linear-gradient(
      0deg,
      rgba(var(--svelte-grab-glow-rgb), 0.18),
      transparent var(--svelte-grab-glow-edge)
    ),
    linear-gradient(
      90deg,
      rgba(var(--svelte-grab-glow-rgb), 0.14),
      transparent var(--svelte-grab-glow-edge)
    ),
    linear-gradient(
      270deg,
      rgba(var(--svelte-grab-glow-rgb), 0.14),
      transparent var(--svelte-grab-glow-edge)
    );
  box-shadow:
    inset 0 0 50px rgba(var(--svelte-grab-glow-rgb), 0.18),
    inset 0 0 110px rgba(var(--svelte-grab-glow-rgb), 0.12),
    inset 0 0 180px rgba(var(--svelte-grab-glow-rgb), 0.08);
  opacity: 0;
  transition: opacity 160ms ease;
}

#${OVERLAY_ROOT_ID} .svelte-grab-frame-glow::before {
  content: "";
  position: absolute;
  inset: var(--svelte-grab-frame-inset);
  border-radius: var(--svelte-grab-frame-radius);
  box-shadow:
    0 0 28px rgba(var(--svelte-grab-glow-rgb), 0.26),
    0 0 72px rgba(var(--svelte-grab-glow-rgb), 0.18),
    0 0 140px rgba(var(--svelte-grab-glow-rgb), 0.12),
    inset 0 0 32px rgba(var(--svelte-grab-glow-rgb), 0.12);
  filter: blur(10px);
}

#${OVERLAY_ROOT_ID} .svelte-grab-frame-glow::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(var(--svelte-grab-glow-rgb), 0.16), transparent 20%),
    radial-gradient(circle at top right, rgba(var(--svelte-grab-glow-rgb), 0.16), transparent 20%),
    radial-gradient(circle at bottom left, rgba(var(--svelte-grab-glow-rgb), 0.12), transparent 20%),
    radial-gradient(circle at bottom right, rgba(var(--svelte-grab-glow-rgb), 0.12), transparent 20%);
  filter: blur(18px);
}

#${OVERLAY_ROOT_ID} .svelte-grab-frame-glow[data-active="true"] {
  opacity: 1;
  animation: svelte-grab-frame-glow-pulse 2.2s ease-in-out infinite;
}

#${OVERLAY_ROOT_ID} .svelte-grab-frame[data-active="true"] {
  opacity: 1;
  animation: svelte-grab-frame-pulse 2.4s ease-in-out infinite;
}

#${OVERLAY_ROOT_ID} .svelte-grab-box {
  position: fixed;
  border: 2px solid #0f766e;
  background: rgba(15, 118, 110, 0.08);
  box-shadow: 0 0 0 1px rgba(240, 253, 250, 0.75) inset;
  transition:
    opacity 80ms linear,
    background 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease;
}

#${OVERLAY_ROOT_ID} .svelte-grab-box[data-flash="true"][data-tone="success"] {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.18);
  box-shadow:
    0 0 0 1px rgba(236, 253, 245, 0.9) inset,
    0 0 0 6px rgba(16, 185, 129, 0.16);
}

#${OVERLAY_ROOT_ID} .svelte-grab-box[data-flash="true"][data-tone="error"] {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.14);
  box-shadow:
    0 0 0 1px rgba(254, 242, 242, 0.9) inset,
    0 0 0 6px rgba(239, 68, 68, 0.12);
}

#${OVERLAY_ROOT_ID} .svelte-grab-label {
  position: fixed;
  max-width: min(32rem, calc(100vw - 24px));
  padding: 0.5rem 0.75rem;
  border-radius: 0.65rem;
  color: #ecfeff;
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(45, 212, 191, 0.5);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.24);
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
}

#${OVERLAY_ROOT_ID} .svelte-grab-notice {
  position: fixed;
  max-width: min(18rem, calc(100vw - 24px));
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  color: #f8fafc;
  background: rgba(15, 23, 42, 0.94);
  border: 1px solid rgba(100, 116, 139, 0.45);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.28);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  transform: translate(-50%, -50%);
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar {
  position: fixed;
  left: 50%;
  bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 28px;
  padding: 0;
  border-radius: 999px;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow:
    0 14px 40px rgba(15, 23, 42, 0.18),
    0 1px 0 rgba(255, 255, 255, 0.75) inset;
  transform: translateX(-50%);
  pointer-events: auto;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar::before,
#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-ghost::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 100%;
  width: 96px;
  height: 14px;
  transform: translateX(-50%);
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar[data-active="true"] {
  border-color: rgba(15, 118, 110, 0.32);
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar[hidden] {
  display: none;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-popup {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 2px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 14px;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(100, 116, 139, 0.38);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.24);
  transform: translateX(-50%) translateY(6px);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-popup-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-popup-copy {
  font-size: 10px;
  color: #94a3b8;
  white-space: nowrap;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar:hover .svelte-grab-toolbar-popup,
#${OVERLAY_ROOT_ID} .svelte-grab-toolbar:focus-within .svelte-grab-toolbar-popup,
#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-ghost:hover .svelte-grab-toolbar-popup,
#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-ghost:focus-within .svelte-grab-toolbar-popup {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-shortcut {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #cbd5e1;
  white-space: nowrap;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-shortcut kbd {
  min-width: 18px;
  padding: 0.12rem 0.32rem;
  border-radius: 6px;
  font-family: inherit;
  font-size: 10px;
  text-align: center;
  color: #f8fafc;
  background: rgba(51, 65, 85, 0.92);
  border: 1px solid rgba(100, 116, 139, 0.45);
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-hide {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 0 10px;
  border: 1px solid rgba(100, 116, 139, 0.45);
  border-radius: 999px;
  color: #f8fafc;
  background: rgba(51, 65, 85, 0.92);
  font: inherit;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  transition:
    background 120ms ease,
    border-color 120ms ease,
    transform 120ms ease;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-hide:hover {
  background: rgba(71, 85, 105, 0.96);
  border-color: rgba(148, 163, 184, 0.6);
}

#${OVERLAY_ROOT_ID} .svelte-grab-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toggle:focus-visible,
#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-hide:focus-visible,
#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-ghost:focus-visible {
  outline: 2px solid rgba(45, 212, 191, 0.6);
  outline-offset: 2px;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toggle-track {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.18);
  transition: background 140ms ease;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toggle[aria-pressed="true"] .svelte-grab-toggle-track {
  background: #0f172a;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18);
  transition: transform 140ms ease;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toggle[aria-pressed="true"] .svelte-grab-toggle-thumb {
  transform: translateX(14px);
}

#${OVERLAY_ROOT_ID} .svelte-grab-notice[data-tone="success"] {
  background: rgba(6, 78, 59, 0.96);
  border-color: rgba(52, 211, 153, 0.5);
}

#${OVERLAY_ROOT_ID} .svelte-grab-notice[data-tone="error"] {
  background: rgba(127, 29, 29, 0.96);
  border-color: rgba(248, 113, 113, 0.5);
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-ghost {
  position: fixed;
  left: 50%;
  bottom: 18px;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.12);
  box-shadow:
    0 8px 24px rgba(15, 23, 42, 0.14),
    0 0 0 1px rgba(148, 163, 184, 0.35) inset;
  transform: translateX(-50%);
  pointer-events: auto;
  cursor: pointer;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-ghost::before {
  border-radius: 999px;
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-ghost::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.62);
}

#${OVERLAY_ROOT_ID} .svelte-grab-toolbar-ghost[hidden] {
  display: none;
}

@media (max-width: 640px) {
  #${OVERLAY_ROOT_ID} .svelte-grab-toolbar {
    bottom: 14px;
  }
}
`;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const createOverlay = (options: CreateOverlayOptions = {}) => {
  const root = document.createElement("div");
  root.id = OVERLAY_ROOT_ID;
  root.setAttribute(OVERLAY_IGNORE_ATTR, "true");
  const storedToolbarHidden = window.localStorage.getItem(TOOLBAR_HIDDEN_STORAGE_KEY);
  let toolbarHidden = storedToolbarHidden === "true";
  let flashState: OverlayFlashState | null = null;
  let flashTimeout: number | undefined;
  let lastRect: DOMRect | null = null;

  const style = document.createElement("style");
  style.textContent = styles;

  const frameGlow = document.createElement("div");
  frameGlow.className = "svelte-grab-frame-glow";

  const frame = document.createElement("div");
  frame.className = "svelte-grab-frame";

  const box = document.createElement("div");
  box.className = "svelte-grab-box";

  const label = document.createElement("div");
  label.className = "svelte-grab-label";

  const notice = document.createElement("div");
  notice.className = "svelte-grab-notice";

  const toolbar = document.createElement("div");
  toolbar.className = "svelte-grab-toolbar";
  toolbar.dataset.svelteGrabToolbar = "true";
  toolbar.setAttribute(OVERLAY_IGNORE_ATTR, "true");

  const toolbarPopup = document.createElement("div");
  toolbarPopup.className = "svelte-grab-toolbar-popup";
  toolbarPopup.setAttribute(OVERLAY_IGNORE_ATTR, "true");

  const shortcutRow = document.createElement("div");
  shortcutRow.className = "svelte-grab-toolbar-popup-row";

  const shortcutLabel = document.createElement("div");
  shortcutLabel.className = "svelte-grab-toolbar-popup-copy";
  shortcutLabel.textContent = "Activate with:";

  const shortcut = document.createElement("div");
  shortcut.className = "svelte-grab-toolbar-shortcut";
  shortcut.innerHTML = "<kbd>Alt</kbd><span>+</span><kbd>Shift</kbd><span>+</span><kbd>G</kbd>";

  const hideButton = document.createElement("button");
  hideButton.type = "button";
  hideButton.className = "svelte-grab-toolbar-hide";
  hideButton.textContent = "Hide";
  hideButton.setAttribute(OVERLAY_IGNORE_ATTR, "true");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "svelte-grab-toggle";
  toggle.dataset.svelteGrabToggle = "true";
  toggle.setAttribute(OVERLAY_IGNORE_ATTR, "true");

  const toggleTrack = document.createElement("span");
  toggleTrack.className = "svelte-grab-toggle-track";

  const toggleThumb = document.createElement("span");
  toggleThumb.className = "svelte-grab-toggle-thumb";

  const toolbarGhost = document.createElement("button");
  toolbarGhost.type = "button";
  toolbarGhost.className = "svelte-grab-toolbar-ghost";
  toolbarGhost.setAttribute("aria-label", "Show grab toggle");
  toolbarGhost.setAttribute(OVERLAY_IGNORE_ATTR, "true");
  toolbarGhost.dataset.svelteGrabToolbarGhost = "true";

  const ghostPopup = document.createElement("div");
  ghostPopup.className = "svelte-grab-toolbar-popup";
  ghostPopup.setAttribute(OVERLAY_IGNORE_ATTR, "true");

  const ghostShow = document.createElement("button");
  ghostShow.type = "button";
  ghostShow.className = "svelte-grab-toolbar-hide";
  ghostShow.textContent = "Show";
  ghostShow.setAttribute(OVERLAY_IGNORE_ATTR, "true");

  ghostPopup.append(ghostShow);
  toolbarGhost.append(ghostPopup);

  toggleTrack.append(toggleThumb);
  toggle.append(toggleTrack);
  shortcutRow.append(shortcutLabel, shortcut);
  toolbarPopup.append(shortcutRow, hideButton);
  toolbar.append(toggle, toolbarPopup);
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    options.onToggle?.();
  });
  hideButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toolbarHidden = true;
    window.localStorage.setItem(TOOLBAR_HIDDEN_STORAGE_KEY, "true");
    renderToolbar();
  });
  toolbarGhost.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toolbarHidden = false;
    window.localStorage.setItem(TOOLBAR_HIDDEN_STORAGE_KEY, "false");
    renderToolbar();
  });
  ghostShow.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toolbarHidden = false;
    window.localStorage.setItem(TOOLBAR_HIDDEN_STORAGE_KEY, "false");
    renderToolbar();
  });

  root.append(style, frameGlow, frame, box, label, notice, toolbar, toolbarGhost);
  document.body.append(root);

  const renderToolbar = (): void => {
    toolbar.hidden = toolbarHidden;
    toolbarGhost.hidden = !toolbarHidden;
  };

  const renderFlash = (): void => {
    const fallbackRect = toolbarHidden
      ? toolbarGhost.getBoundingClientRect()
      : toolbar.getBoundingClientRect();
    const rect = flashState?.rect ?? lastRect ?? fallbackRect;

    if (!flashState || !rect) {
      notice.style.display = "none";
      box.dataset.flash = "false";
      delete box.dataset.tone;
      return;
    }

    const centerX = clamp(
      rect.left + rect.width / 2,
      20,
      window.innerWidth - 20,
    );
    const centerY = clamp(
      rect.top + rect.height / 2,
      20,
      window.innerHeight - 20,
    );

    notice.style.display = "block";
    notice.textContent = flashState.message;
    notice.dataset.tone = flashState.tone;
    notice.style.left = `${centerX}px`;
    notice.style.top = `${centerY}px`;
    box.dataset.flash = "true";
    box.dataset.tone = flashState.tone;
  };

  return {
    destroy() {
      if (flashTimeout !== undefined) {
        window.clearTimeout(flashTimeout);
      }

      root.remove();
    },
    flash(message: string, options: OverlayFlashOptions = {}) {
      flashState = {
        message,
        rect: options.rect ?? lastRect,
        tone: options.tone ?? "success",
      };
      renderFlash();

      if (flashTimeout !== undefined) {
        window.clearTimeout(flashTimeout);
      }

      flashTimeout = window.setTimeout(() => {
        flashState = null;
        renderFlash();
      }, options.duration ?? 1600);
    },
    markIgnored(element: Element) {
      element.setAttribute(OVERLAY_IGNORE_ATTR, "true");
    },
    showToolbar() {
      toolbarHidden = false;
      window.localStorage.setItem(TOOLBAR_HIDDEN_STORAGE_KEY, "false");
      renderToolbar();
    },
    update(overlayState: OverlayState) {
      lastRect = overlayState.rect;
      frameGlow.dataset.active = overlayState.active ? "true" : "false";
      frame.dataset.active = overlayState.active ? "true" : "false";
      box.style.display =
        overlayState.visible && overlayState.rect ? "block" : "none";
      label.style.display = overlayState.visible ? "block" : "none";
      toolbar.dataset.active = overlayState.active ? "true" : "false";
      toggle.setAttribute(
        "aria-label",
        overlayState.active ? "Disable sveltegrab" : "Enable sveltegrab",
      );
      toggle.setAttribute(
        "aria-pressed",
        overlayState.active ? "true" : "false",
      );

      if (overlayState.rect) {
        box.style.left = `${overlayState.rect.left}px`;
        box.style.top = `${overlayState.rect.top}px`;
        box.style.width = `${overlayState.rect.width}px`;
        box.style.height = `${overlayState.rect.height}px`;
      }

      label.textContent = overlayState.message;
      label.style.left = `${clamp(
        overlayState.x + 12,
        8,
        window.innerWidth - 320,
      )}px`;
      label.style.top = `${clamp(
        overlayState.y + 12,
        8,
        window.innerHeight - 80,
      )}px`;
      renderToolbar();
      renderFlash();
    },
  };
};

export const overlayIgnoreAttr = OVERLAY_IGNORE_ATTR;
