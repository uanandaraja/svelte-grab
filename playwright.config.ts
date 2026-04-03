import { existsSync } from "node:fs";

import { defineConfig } from "@playwright/test";

const systemChromiumPath = "/run/current-system/sw/bin/chromium";
const executablePath = existsSync(systemChromiumPath)
  ? systemChromiumPath
  : undefined;

export default defineConfig({
  testDir: "./packages/e2e/tests",
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    permissions: ["clipboard-read", "clipboard-write"],
    launchOptions: {
      executablePath,
    },
  },
  webServer: {
    command:
      "bun run --filter playground-sveltekit dev --host 127.0.0.1 --port 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
