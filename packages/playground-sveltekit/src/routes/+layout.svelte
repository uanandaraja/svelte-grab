<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { browser, dev } from "$app/environment";

	let { children } = $props();

	if (browser && dev) {
		void import("svelte-grab/auto");
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
