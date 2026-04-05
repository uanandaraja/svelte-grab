import path from "node:path";
import { fileURLToPath } from "node:url";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url));

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: [
			{
				find: "@uanandaraja/sveltegrab/auto",
				replacement: path.resolve(
					workspaceRoot,
					"packages/svelte-grab/src/auto.ts",
				),
			},
		],
	},
});
