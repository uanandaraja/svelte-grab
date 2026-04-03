import { describe, expect, it } from "vitest";
import { formatStackContext } from "./format-stack.js";
import { resolveSvelteSource } from "./resolve-source.js";

const createElementWithMeta = (): HTMLButtonElement => {
  const element = document.createElement("button");
  element.__svelte_meta = {
    loc: {
      file: "/src/lib/Button.svelte",
      line: 12,
      column: 4,
    },
    parent: {
      type: "if",
      file: "/src/routes/+page.svelte",
      line: 40,
      column: 2,
      parent: {
        type: "component",
        file: "/src/routes/+page.svelte",
        line: 8,
        column: 0,
        componentTag: "Button",
      },
    },
  };
  document.body.append(element);
  return element;
};

describe("resolveSvelteSource", () => {
  it("resolves the nearest svelte meta element and normalizes columns", () => {
    const element = createElementWithMeta();
    const child = document.createElement("span");
    element.append(child);

    const source = resolveSvelteSource(child);

    expect(source).not.toBeNull();
    expect(source?.filePath).toBe("/src/lib/Button.svelte");
    expect(source?.lineNumber).toBe(12);
    expect(source?.columnNumber).toBe(5);
    expect(source?.componentName).toBe("Button");
    expect(source?.stack.map((frame) => frame.type)).toEqual(["if", "component"]);
  });

  it("formats stack context in a readable form", () => {
    const element = createElementWithMeta();
    const source = resolveSvelteSource(element);

    expect(formatStackContext(source)).toContain("/src/lib/Button.svelte:12:5");
    expect(formatStackContext(source)).toContain("in Button (/src/routes/+page.svelte:8:1)");
  });
});
