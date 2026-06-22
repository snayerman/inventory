<script lang="ts">
  import { onMount } from 'svelte'
  import CardDetail from './lib/CardDetail.svelte'
  import CardGrid from './lib/CardGrid.svelte'
  import { loadPokemonCards } from './lib/data'
  import { searchCards } from './lib/search'
  import { cardConditions, cardVariants, type PokemonCard } from './lib/types'

  let cards: PokemonCard[] = []
  let selectedId: string | undefined
  let query = ''
  let variant = 'all'
  let condition = 'all'
  let language = 'all'
  let loading = true
  let error = ''
  let filtersOpen = false

  onMount(async () => {
    try {
      cards = await loadPokemonCards()
    } catch (loadError) {
      error = loadError instanceof Error ? loadError.message : 'Could not load inventory.'
    } finally {
      loading = false
    }
  })

  $: languages = Array.from(new Set(cards.map((card) => card.language))).sort((a, b) =>
    a.localeCompare(b),
  )
  $: filteredByControls = cards.filter((card) => {
    const matchesVariant = variant === 'all' || card.variant === variant
    const matchesCondition = condition === 'all' || card.condition === condition
    const matchesLanguage = language === 'all' || card.language === language

    return matchesVariant && matchesCondition && matchesLanguage
  })
  $: filteredCards = searchCards(filteredByControls, query)

  $: selectedCard = cards.find((card) => card.id === selectedId)

  function selectCard(card: PokemonCard) {
    selectedId = card.id
  }

  function resetFilters() {
    query = ''
    variant = 'all'
    condition = 'all'
    language = 'all'
  }

  function closeModal() {
    selectedId = undefined
  }
</script>

<svelte:window on:keydown={(event) => event.key === 'Escape' && closeModal()} />

<main class="app-shell">
  <section class="controls" class:filters-open={filtersOpen} aria-label="Inventory filters">
    <label class="search-field">
      <span>Search</span>
      <input
        bind:value={query}
        type="search"
        placeholder="Name, set, number, notes..."
        autocomplete="off"
      />
    </label>

    <button
      class="ghost-button filters-toggle"
      type="button"
      aria-expanded={filtersOpen}
      on:click={() => (filtersOpen = !filtersOpen)}
    >
      {filtersOpen ? 'Hide filters' : 'Filters'}
    </button>

    <label class="filter-field">
      <span>Variant</span>
      <select bind:value={variant}>
        <option value="all">All variants</option>
        {#each cardVariants as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>

    <label class="filter-field">
      <span>Condition</span>
      <select bind:value={condition}>
        <option value="all">All conditions</option>
        {#each cardConditions as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>

    <label class="filter-field">
      <span>Language</span>
      <select bind:value={language}>
        <option value="all">All languages</option>
        {#each languages as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>

    <button class="ghost-button reset-button" type="button" on:click={resetFilters}>Reset</button>
  </section>

  {#if loading}
    <section class="status-panel">
      <p>Loading inventory...</p>
    </section>
  {:else if error}
    <section class="status-panel error-panel">
      <h2>Inventory could not load</h2>
      <p>{error}</p>
    </section>
  {:else}
    <section class="workspace">
      <div class="list-panel">
        <div class="list-header">
          <div>
            <p class="eyebrow">{filteredCards.length} matching</p>
            <h2>Cards</h2>
          </div>
          <button class="ghost-button" type="button" on:click={resetFilters}>Clear filters</button>
        </div>

        <CardGrid cards={filteredCards} {selectedId} onSelect={selectCard} />
      </div>
    </section>

    {#if selectedCard}
      <div class="modal-layer">
        <button
          class="modal-backdrop"
          type="button"
          aria-label="Close card details"
          on:click={closeModal}
        ></button>
        <div class="modal-shell" role="dialog" aria-modal="true" tabindex="-1">
          <CardDetail card={selectedCard} onClose={closeModal} />
        </div>
      </div>
    {/if}
  {/if}
</main>

<style lang="postcss">
  :global(:root) {
    color: #1d2433;
    background: #f6f7f9;
    --page-max-width: 1520px;
    --sticky-offset: 94px;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(html),
  :global(body),
  :global(#app) {
    height: 100%;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    min-width: 320px;
    min-height: 100vh;
    margin: 0;
  }

  :global(button),
  :global(input),
  :global(select) {
    font: inherit;
  }

  :global(button) {
    cursor: pointer;
  }

  :global(.eyebrow) {
    margin: 0 0 8px;
    color: #7d6f58;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  :global(h2),
  :global(h3),
  :global(p) {
    margin-top: 0;
  }

  :global(h2) {
    margin-bottom: 0;
    color: #111827;
    font-size: 1.45rem;
    letter-spacing: -0.03em;
  }

  :global(h3) {
    margin-bottom: 4px;
    color: #111827;
    font-size: 1rem;
    letter-spacing: -0.02em;
  }

  :global(.ghost-button) {
    min-height: 44px;
    border: 1px solid #cfd6e1;
    border-radius: 4px;
    background: #fff;
    color: #111827;
    font-weight: 800;
    padding: 0 16px;
  }

  :global(.ghost-button:focus-visible) {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.12);
  }

  .app-shell {
    width: 100%;
    height: 100vh;
    margin: 0 auto;
    padding: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    overflow: hidden;
  }

  .controls,
  .list-panel,
  .status-panel {
    border: 1px solid #d9dee7;
    background: #fff;
    box-shadow: 0 12px 32px rgba(31, 38, 54, 0.06);
  }

  .controls {
    position: sticky;
    top: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: minmax(240px, 1fr) repeat(3, minmax(150px, 190px)) auto;
    gap: 12px;
    width: 100%;
    margin: 0;
    padding: 12px max(16px, calc((100vw - var(--page-max-width)) / 2 + 16px));
    border-width: 0 0 1px;
    background: rgba(255, 255, 255, 0.98);
  }

  label {
    display: grid;
    gap: 6px;
    color: #667085;
    font-size: 0.8rem;
    font-weight: 700;
  }

  input,
  select {
    width: 100%;
    min-height: 44px;
    border: 1px solid #cfd6e1;
    border-radius: 4px;
    background: white;
    color: #111827;
    outline: none;
    padding: 0 12px;
  }

  input:focus,
  select:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.12);
  }

  .reset-button {
    align-self: end;
  }

  .filters-toggle {
    display: none;
    align-self: end;
  }

  .workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    width: min(var(--page-max-width), calc(100vw - 32px));
    min-height: 0;
    margin: 18px auto 0;
    overflow: hidden;
  }

  .list-panel,
  .status-panel {
    border-radius: 6px;
  }

  .list-panel {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 18px;
  }

  .list-header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .status-panel {
    display: grid;
    place-items: center;
    width: min(var(--page-max-width), calc(100vw - 32px));
    min-height: 420px;
    margin: 18px auto 0;
    padding: 32px;
    color: #667085;
    text-align: center;
  }

  .error-panel {
    color: #9f1239;
  }

  .modal-layer {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: grid;
    place-items: center;
    padding: 24px;
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(15, 23, 42, 0.58);
  }

  .modal-shell {
    position: relative;
    z-index: 1;
    width: min(1120px, 100%);
    height: min(86vh, 920px);
  }

  @media (max-width: 1100px) {
    .controls {
      grid-template-columns: 1fr auto;
      align-items: end;
    }

    .filters-toggle {
      display: inline-flex;
      align-items: center;
    }

    .filter-field,
    .controls .reset-button {
      display: none;
    }

    .controls.filters-open {
      grid-template-columns: 1fr;
    }

    .controls.filters-open .filter-field {
      display: grid;
    }

    .controls.filters-open .reset-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }

  @media (max-width: 720px) {
    .app-shell {
      padding: 0;
    }

    .list-header {
      align-items: center;
      gap: 12px;
    }

    .controls,
    .list-panel {
      border-radius: 0;
    }

    .modal-layer {
      align-items: stretch;
      padding: 0;
    }

    .modal-shell {
      width: 100%;
      height: 100%;
    }

    .workspace {
      width: 100%;
      margin-top: 12px;
      padding: 0 10px;
    }

    .status-panel {
      width: calc(100vw - 20px);
    }
  }
</style>
