<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { browser, dev } from "$app/environment";

	let { children } = $props();

	if (browser && dev) {
		void import("@uanandaraja/sveltegrab/auto");
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
