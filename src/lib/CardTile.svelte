<script lang="ts">
  import type { PokemonCard } from './types'

  export let card: PokemonCard
  export let selected = false
  export let onSelect: (card: PokemonCard) => void

  let imageFailed = false

  $: price = card.price?.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  })
  $: subtitle = card.set ? `${card.set} · ${card.number}` : card.number

  $: {
    card.id
    imageFailed = false
  }
</script>

<button
  class:selected
  class="card-tile"
  type="button"
  aria-pressed={selected}
  on:click={() => onSelect(card)}
>
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
    <div>
      <h3>{card.name}</h3>
      <p>{subtitle}</p>
    </div>
    <div class="chips" aria-label="Card attributes">
      <span>{card.variant}</span>
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
    min-height: 210px;
    overflow: hidden;
    border-radius: 4px;
    background: #f2f4f7;
  }

  .image-frame img {
    width: 100%;
    height: 210px;
    object-fit: contain;
  }

  .image-fallback {
    display: grid;
    place-items: center;
    min-height: 210px;
    padding: 16px;
    color: #667085;
    text-align: center;
  }

  .tile-copy {
    display: grid;
    gap: 12px;
  }

  .tile-copy p {
    margin-bottom: 0;
    color: #667085;
    font-size: 0.9rem;
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
