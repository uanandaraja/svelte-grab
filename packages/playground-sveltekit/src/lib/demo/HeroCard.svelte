<script lang="ts">
	const stats = [
		{ label: "Resolver", value: "__svelte_meta" },
		{ label: "Mode", value: "dev only" },
		{ label: "Focus", value: "copy + open" },
	];
</script>

<article class="hero-card">
	<div class="hero-content">
		<p class="eyebrow">Hover this component</p>
		<h2>HeroCard</h2>
		<p>
			This card gives the overlay a stable component boundary, nested markup, and a primary action to target.
		</p>

		<div class="stat-grid">
			{#each stats as stat}
				<div class="stat-chip">
					<span>{stat.label}</span>
					<strong>{stat.value}</strong>
				</div>
			{/each}
		</div>
	</div>

	<button class="primary-action">Primary action</button>
</article>

<style>
	.hero-card {
		padding: 28px;
		border-radius: 30px;
		display: grid;
		gap: 24px;
		background:
			linear-gradient(135deg, rgba(15, 118, 110, 0.92), rgba(14, 116, 144, 0.92)),
			linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent);
		color: white;
		box-shadow: 0 30px 70px rgba(14, 116, 144, 0.24);
	}

	.hero-content {
		display: grid;
		gap: 14px;
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-size: 12px;
		font-weight: 700;
		margin: 0;
		color: rgba(240, 253, 250, 0.85);
	}

	h2,
	p {
		margin: 0;
	}

	h2 {
		font-size: clamp(2rem, 4vw, 3rem);
		letter-spacing: -0.04em;
	}

	p {
		line-height: 1.6;
		max-width: 34ch;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
	}

	.stat-chip {
		padding: 14px;
		border-radius: 18px;
		background: rgba(240, 253, 250, 0.14);
		display: grid;
		gap: 6px;
	}

	.stat-chip span {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: rgba(240, 253, 250, 0.7);
	}

	.stat-chip strong {
		font-size: 0.98rem;
	}

	.primary-action {
		justify-self: start;
		padding: 14px 20px;
		border: none;
		border-radius: 999px;
		background: white;
		color: #155e75;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	@media (max-width: 640px) {
		.stat-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
