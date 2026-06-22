<script lang="ts">
  import type { PokemonCard } from "./types";

  export let card: PokemonCard | undefined;
  export let onClose: () => void;

  let frontFailed = false;
  let backFailed = false;

  $: {
    card?.id;
    frontFailed = false;
    backFailed = false;
  }

  $: subtitle = card
    ? card.set
      ? `${card.set} · ${card.number}`
      : card.number
    : "";
</script>

<section class="detail-panel" aria-label="Selected card details">
  {#if card}
    <div class="detail-header">
      <div>
        <p class="eyebrow">{subtitle}</p>
        <h2>{card.name}</h2>
      </div>
      <button class="ghost-button" type="button" on:click={onClose}
        >Close</button
      >
    </div>

    <div class="detail-meta">
      <span>{card.variant}</span>
      <span>{card.condition}</span>
      {#if card.language}
        <span>{card.language}</span>
      {/if}

      {#if card.status !== "available"}
        <span>{card.status}</span>
      {/if}
    </div>

    {#if card.notes}
      <section class="notes" aria-label="Notes">
        <span>Notes</span>
        <p>{card.notes}</p>
      </section>
    {/if}

    <div class="closeups">
      <figure>
        <figcaption>Front</figcaption>
        {#if frontFailed}
          <div class="large-fallback">Front image unavailable</div>
        {:else}
          <a
            class="image-link"
            href={card.frontImage}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={card.frontImage}
              alt={`${card.name} front closeup`}
              loading="lazy"
              on:error={() => (frontFailed = true)}
            />
          </a>
        {/if}
      </figure>

      <figure>
        <figcaption>Back</figcaption>
        {#if backFailed}
          <div class="large-fallback">Back image unavailable</div>
        {:else}
          <a
            class="image-link"
            href={card.backImage}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={card.backImage}
              alt={`${card.name} back closeup`}
              loading="lazy"
              on:error={() => (backFailed = true)}
            />
          </a>
        {/if}
      </figure>
    </div>
  {:else}
    <div class="empty-detail">
      <p class="eyebrow">No card selected</p>
      <h2>Pick a card to view closeups.</h2>
      <p>
        Use search and filters to narrow the list, then open the card you are
        listing.
      </p>
    </div>
  {/if}
</section>

<style lang="postcss">
  .detail-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    padding: 20px;
    border: 1px solid #d9dee7;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 12px 32px rgba(31, 38, 54, 0.06);
  }

  .detail-header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .detail-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }

  .detail-meta span {
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

  .notes {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-height: 28px;
    margin: 0 0 12px;
  }

  .notes span {
    color: #667085;
    font-size: 0.75rem;
    font-weight: 800;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .notes p {
    margin: 0;
    color: #111827;
    font-weight: 700;
    line-height: 1.2;
  }

  .closeups {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    min-height: 0;
    flex: 1;
    overflow: hidden;
  }

  figure {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
    margin: 0;
    overflow: hidden;
  }

  figcaption {
    margin: 0 0 8px;
    color: #667085;
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .image-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    border: 1px solid #d9dee7;
    border-radius: 4px;
    background: #f2f4f7;
    cursor: zoom-in;
  }

  .large-fallback {
    display: grid;
    place-items: center;
    color: #667085;
    text-align: center;
  }

  .image-link img,
  .large-fallback {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    max-width: 100%;
    max-height: 100%;
    border-radius: 4px;
    object-fit: contain;
    display: block;
  }

  .large-fallback {
    border: 1px dashed rgba(17, 24, 39, 0.2);
  }

  .empty-detail {
    display: grid;
    align-content: center;
    min-height: 420px;
  }

  .empty-detail p {
    color: #667085;
  }

  @media (max-width: 1100px) {
    .detail-panel {
      overflow-y: auto;
    }

    .closeups {
      grid-template-columns: 1fr;
      flex: 0 0 auto;
      overflow: visible;
    }

    figure {
      overflow: visible;
    }

    .image-link {
      height: auto;
    }

    .image-link img {
      height: auto;
      max-height: none;
    }
  }

  @media (max-width: 720px) {
    .detail-header {
      align-items: center;
      gap: 12px;
    }

    .detail-header .ghost-button {
      flex: none;
      padding: 0 12px;
    }

    .detail-panel {
      border-radius: 0;
    }
  }
</style>
