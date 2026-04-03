import { expect, test } from "@playwright/test";

test("shows overlay activation hint and highlights a svelte element", async ({
  page,
}) => {
  await page.goto("/");

  const toolbar = page.locator("[data-svelte-grab-toolbar='true']");
  const toggle = page.locator("[data-svelte-grab-toggle='true']");
  const frame = page.locator(".svelte-grab-frame");
  const frameGlow = page.locator(".svelte-grab-frame-glow");

  await expect(toolbar).toContainText("svelte-grab");
  await expect(toolbar).toContainText("Off");
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
        const centeredX = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2) < 12;
        const nearBottom = window.innerHeight - rect.bottom < 32;

        return centeredX && nearBottom;
      }),
    )
    .toBe(true);

  await toggle.click();
  await expect(toolbar).toContainText("On");
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
});
