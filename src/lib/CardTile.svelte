<script lang="ts">
	import type { PokemonCard } from "./types";

	export let card: PokemonCard;
	export let selected = false;
	export let onSelect: (card: PokemonCard) => void;

	let imageFailed = false;

	const variantLabels: Record<string, string> = {
		normal: "Normal",
		holo: "Holo",
		reverse: "Reverse",
	};

	$: variantLabel = variantLabels[card.variant] ?? card.variant;
	$: price = card.price?.toLocaleString(undefined, {
		style: "currency",
		currency: "USD",
	});

	$: {
		card.id;
		imageFailed = false;
	}
</script>

<button class:selected class="card-tile" type="button" aria-pressed={selected} on:click={() => onSelect(card)}>
	<div class="image-frame">
		{#if imageFailed}
			<div class="image-fallback">Image unavailable</div>
		{:else}
			<img
				src={card.frontImage}
				alt={`${card.name} front closeup`}
				loading="lazy"
				on:error={() => (imageFailed = true)}
			/>
		{/if}
	</div>

	<div class="tile-copy">
		<div class="card-summary">
			<h3 class="card-title">{card.name}</h3>
			<p class="set-line">
				{#if card.set}
					<span class="set-name">{card.set}</span>
					<span class="card-number">{card.number}</span>
				{:else}
					<span class="card-number">{card.number}</span>
				{/if}
			</p>
			<p class="attribute-line">{variantLabel}</p>
		</div>
		<div class="chips" aria-label="Card attributes">
			<span>{card.condition}</span>
			{#if price}
				<span>{price}</span>
			{/if}
		</div>
	</div>
</button>

<style lang="postcss">
	.card-tile {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		gap: 12px;
		min-width: 0;
		height: 336px;
		border: 1px solid #d9dee7;
		border-radius: 6px;
		background: white;
		color: inherit;
		padding: 12px;
		text-align: left;
		outline: 0 solid transparent;
		outline-offset: -2px;
		transition:
			border-color 160ms ease,
			box-shadow 160ms ease,
			outline-color 160ms ease;
	}

	.card-tile:hover,
	.card-tile.selected {
		border-color: #111827;
		box-shadow: inset 0 0 0 1px #111827;
		outline: 1px solid rgba(17, 24, 39, 0.16);
	}

	.card-tile:focus-visible {
		border-color: #111827;
		box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.12);
	}

	.image-frame {
		display: grid;
		place-items: center;
		min-height: 0;
		height: 100%;
		overflow: hidden;
		border-radius: 4px;
		background: #f2f4f7;
	}

	.image-frame img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.image-fallback {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		padding: 16px;
		color: #667085;
		text-align: center;
	}

	.tile-copy {
		display: grid;
		gap: 12px;
		min-width: 0;
	}

	.card-summary {
		display: grid;
		gap: 4px;
		min-width: 0;
	}

	.card-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tile-copy p {
		margin-bottom: 0;
		color: #667085;
		font-size: 0.9rem;
	}

	.set-line {
		display: flex;
		align-items: baseline;
		gap: 0.35rem;
		min-width: 0;
	}

	.set-name {
		display: block;
		max-width: 70%;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-number {
		flex: none;
		min-width: 0;
	}

	.card-number::before {
		content: "·";
		margin-right: 0.35rem;
	}

	.set-line .card-number:first-child::before {
		content: "";
		margin-right: 0;
	}

	.attribute-line {
		text-transform: capitalize;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.chips span {
		border: 1px solid #d9dee7;
		border-radius: 3px;
		background: #f8fafc;
		color: #475467;
		font-size: 0.75rem;
		font-weight: 800;
		line-height: 1;
		padding: 7px 10px;
		text-transform: uppercase;
	}
</style>
