<script lang="ts">
	import HeroCard from "$lib/demo/HeroCard.svelte";

	const features = [
		{
			label: "Copy plain text + HTML + metadata",
			description: "Select a Svelte element and put its markup and source context on the clipboard.",
		},
		{
			label: "Open source in editor",
			description: "Use Vite's editor bridge first, then fall back to a protocol link.",
		},
		{
			label: "Stack-aware Svelte resolver",
			description: "Walk element metadata and control-flow boundaries without React internals.",
		},
	];

	let showDetails = $state(true);
</script>

<svelte:head>
	<title>svelte-grab playground</title>
</svelte:head>

<main class="page-shell">
	<section class="hero-grid">
		<div class="intro-panel">
			<p class="eyebrow">Dev-only element grabber</p>
			<h1>svelte-grab playground</h1>
			<p class="lead">
				Press <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>G</kbd>, hover something real, then click to copy
				or press <kbd>O</kbd> to jump to the source file.
			</p>

			<button class="toggle" onclick={() => (showDetails = !showDetails)}>
				{showDetails ? "Hide" : "Show"} detail panel
			</button>
		</div>

		<HeroCard />
	</section>

	{#if showDetails}
		<section class="details-panel">
			<header>
				<p class="eyebrow">Control-flow fixtures</p>
				<h2>Blocks you can hover</h2>
			</header>

			<div class="feature-list">
				{#each features as feature}
					<article class="feature-card">
						<h3>{feature.label}</h3>
						<p>{feature.description}</p>
					</article>
				{/each}
			</div>
		</section>
	{/if}

	<footer class="footer-note" data-svelte-grab-ignore="true">
		Overlay roots and explicitly ignored elements are skipped.
	</footer>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family:
			"IBM Plex Sans",
			Inter,
			system-ui,
			sans-serif;
		background:
			radial-gradient(circle at top left, rgba(191, 219, 254, 0.8), transparent 30%),
			linear-gradient(160deg, #f8fafc, #e2e8f0 45%, #f8fafc);
		color: #0f172a;
	}

	.page-shell {
		min-height: 100vh;
		padding: 48px 24px 72px;
		display: grid;
		gap: 32px;
		max-width: 1120px;
		margin: 0 auto;
	}

	.hero-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
		align-items: stretch;
	}

	.intro-panel,
	.details-panel {
		padding: 28px;
		border-radius: 28px;
		background: rgba(255, 255, 255, 0.82);
		border: 1px solid rgba(148, 163, 184, 0.35);
		box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
		backdrop-filter: blur(14px);
	}

	.eyebrow {
		margin: 0 0 12px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 12px;
		font-weight: 700;
		color: #0f766e;
	}

	h1,
	h2,
	h3,
	p {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		line-height: 0.98;
		letter-spacing: -0.05em;
		margin-bottom: 16px;
	}

	.lead {
		font-size: 1.05rem;
		line-height: 1.7;
		max-width: 56ch;
		color: #334155;
	}

	.toggle {
		margin-top: 24px;
		border: none;
		border-radius: 999px;
		padding: 12px 18px;
		background: linear-gradient(135deg, #0f766e, #155e75);
		color: white;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.feature-list {
		margin-top: 20px;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 16px;
	}

	.feature-card {
		padding: 18px;
		border-radius: 20px;
		background: #f8fafc;
		border: 1px solid #cbd5e1;
		display: grid;
		gap: 10px;
	}

	.feature-card p {
		color: #475569;
		line-height: 1.6;
	}

	.footer-note {
		color: #64748b;
		font-size: 0.95rem;
	}

	kbd {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		padding: 0.2rem 0.45rem;
		border-radius: 0.45rem;
		border: 1px solid #cbd5e1;
		background: white;
	}
</style>
