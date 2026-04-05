# @uanandaraja/sveltegrab

Dev-only element grabber for Svelte and SvelteKit.

`@uanandaraja/sveltegrab` lets you hover a rendered element, copy its HTML with source location metadata, and jump to the source file in your editor during local development.

## Install

```bash
bun add -d @uanandaraja/sveltegrab
```

## SvelteKit

Load it only in the browser and only in dev mode:

```svelte
<script lang="ts">
	import { browser, dev } from "$app/environment";

	if (browser && dev) {
		void import("@uanandaraja/sveltegrab/auto");
	}
</script>
```

## Controls

- `Alt+Shift+G`: toggle on or off
- `Click` or `Enter`: copy hovered element
- `O`: open source in editor
- `Esc`: disable

## Ignore Elements

Add `data-svelte-grab-ignore="true"` to any element you want the overlay to skip.
