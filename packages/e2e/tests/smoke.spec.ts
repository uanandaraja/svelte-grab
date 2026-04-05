import { expect, test } from "@playwright/test";

test("shows overlay activation hint and highlights a svelte element", async ({
  page,
}) => {
  await page.goto("/");

  const toolbar = page.locator("[data-svelte-grab-toolbar='true']");
  const toggle = page.locator("[data-svelte-grab-toggle='true']");
  const ghost = page.locator("[data-svelte-grab-toolbar-ghost='true']");
  const toolbarPopup = toolbar.locator(".svelte-grab-toolbar-popup");
  const toolbarHide = toolbar.getByRole("button", { name: "Hide", exact: true });
  const frame = page.locator(".svelte-grab-frame");
  const frameGlow = page.locator(".svelte-grab-frame-glow");

  await expect(toolbar).toBeVisible();
  await expect(ghost).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(frame).toHaveAttribute("data-active", "false");
  await expect(frameGlow).toHaveAttribute("data-active", "false");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const toolbarElement = document.querySelector(
          "[data-svelte-grab-toolbar='true']",
        );

        if (!(toolbarElement instanceof HTMLElement)) {
          return false;
        }

        const rect = toolbarElement.getBoundingClientRect();
        const compactWidth = rect.width <= 50;
        const centeredX = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2) < 12;
        const nearBottom = window.innerHeight - rect.bottom < 32;

        return compactWidth && centeredX && nearBottom;
      }),
    )
    .toBe(true);

  await toolbar.hover();
  await expect(toolbarHide).toBeVisible();
  await expect(toolbarPopup.getByText("Activate with:")).toBeVisible();
  await expect(toolbarPopup.getByText("Alt", { exact: true })).toBeVisible();
  await expect(toolbarPopup.getByText("Shift", { exact: true })).toBeVisible();
  await expect(toolbarPopup.getByText("G", { exact: true })).toBeVisible();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(frame).toHaveAttribute("data-active", "true");
  await expect(frameGlow).toHaveAttribute("data-active", "true");

  await page.getByRole("button", { name: "Primary action" }).hover();
  await expect(page.getByText(/component: HeroCard/)).toBeVisible();

  await page.getByRole("button", { name: "Primary action" }).click();
  await expect(page.locator(".svelte-grab-notice")).toContainText(
    "Copied <button>",
  );
  await expect
    .poll(() =>
      page.evaluate(() => {
        const button = document.querySelector("button.primary-action");
        const notice = document.querySelector(".svelte-grab-notice");

        if (!(button instanceof HTMLElement) || !(notice instanceof HTMLElement)) {
          return false;
        }

        const buttonRect = button.getBoundingClientRect();
        const noticeRect = notice.getBoundingClientRect();
        const noticeCenterX = noticeRect.left + noticeRect.width / 2;
        const noticeCenterY = noticeRect.top + noticeRect.height / 2;

        return (
          noticeCenterX >= buttonRect.left &&
          noticeCenterX <= buttonRect.right &&
          noticeCenterY >= buttonRect.top &&
          noticeCenterY <= buttonRect.bottom
        );
      }),
    )
    .toBe(true);

  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("Primary action");

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain("HeroCard.svelte");

  await toolbar.hover();
  await toolbarHide.click();
  await expect(toolbar).toBeHidden();
  await expect(ghost).toBeVisible();

  await ghost.hover();
  await expect(ghost.getByRole("button", { name: "Show", exact: true })).toBeVisible();
  await ghost.click();
  await expect(toolbar).toBeVisible();
  await expect(ghost).toBeHidden();

  await toolbar.hover();
  await toolbarHide.click();
  await expect(toolbar).toBeHidden();
  await expect(ghost).toBeVisible();

  await page.keyboard.press("Alt+Shift+G");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toolbar).toBeHidden();
  await expect(ghost).toBeVisible();

  await page.keyboard.press("Alt+Shift+G");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toolbar).toBeVisible();
  await expect(ghost).toBeHidden();
});
