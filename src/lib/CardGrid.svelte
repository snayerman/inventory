<script lang="ts">
  import { onMount } from 'svelte'
  import { createVirtualizer } from '@tanstack/svelte-virtual'
  import CardTile from './CardTile.svelte'
  import type { PokemonCard } from './types'

  export let cards: PokemonCard[] = []
  export let selectedId: string | undefined
  export let onSelect: (card: PokemonCard) => void

  let gridElement: HTMLDivElement
  let scrollElement: HTMLDivElement
  let width = 0

  const gap = 16
  const minCardWidth = 220
  const rowHeight = 360

  $: columns = Math.max(1, Math.floor((width + gap) / (minCardWidth + gap)))
  $: rows = Array.from({ length: Math.ceil(cards.length / columns) }, (_, index) =>
    cards.slice(index * columns, index * columns + columns),
  )

  const rowVirtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => scrollElement,
    estimateSize: () => rowHeight,
    overscan: 5,
  })

  $: $rowVirtualizer.setOptions({
    count: rows.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => rowHeight,
    overscan: 5,
  })

  onMount(() => {
    if (!gridElement) {
      return
    }

    const updateMeasurements = () => {
      width = gridElement.clientWidth
    }

    const observer = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width
    })

    observer.observe(gridElement)
    updateMeasurements()
    window.addEventListener('resize', updateMeasurements)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateMeasurements)
    }
  })
</script>

<div class="grid-shell" bind:this={gridElement}>
  {#if cards.length === 0}
    <div class="empty-results">
      <p>No cards match those filters.</p>
    </div>
  {:else}
    <div class="virtual-scroll" bind:this={scrollElement}>
      <div class="virtual-canvas" style={`height: ${$rowVirtualizer.getTotalSize()}px;`}>
        {#each $rowVirtualizer.getVirtualItems() as virtualRow (virtualRow.key)}
          <div
            class="virtual-row"
            style={`transform: translateY(${virtualRow.start}px); grid-template-columns: repeat(${columns}, minmax(0, 1fr));`}
          >
            {#each rows[virtualRow.index] as card (card.id)}
              <CardTile {card} selected={card.id === selectedId} {onSelect} />
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  .grid-shell {
    min-height: 0;
    flex: 1;
    overflow: hidden;
  }

  .virtual-scroll {
    height: 100%;
    overflow: auto;
    padding-right: 6px;
  }

  .virtual-canvas {
    position: relative;
    width: 100%;
  }

  .virtual-row {
    position: absolute;
    left: 0;
    right: 0;
    display: grid;
    gap: 16px;
    min-height: 344px;
  }

  .empty-results {
    display: grid;
    place-items: center;
    color: #667085;
    text-align: center;
  }
</style>
