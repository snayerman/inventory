import Fuse from 'fuse.js'
import type { PokemonCard } from './types'

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function searchableText(card: PokemonCard): string {
  return normalize(
    [
      card.name,
      card.number,
      card.set ?? '',
      card.variant,
      card.condition,
      card.language,
      card.notes ?? '',
    ].join(' '),
  )
}

function queryTokens(query: string): string[] {
  return normalize(query).split(' ').filter(Boolean)
}

export function searchCards(cards: PokemonCard[], query: string): PokemonCard[] {
  const tokens = queryTokens(query)

  if (tokens.length === 0) {
    return cards
  }

  const fuse = new Fuse(
    cards.map((card) => ({
      ...card,
      searchable: searchableText(card),
    })),
    {
      threshold: 0.35,
      ignoreLocation: true,
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'number', weight: 0.3 },
        { name: 'set', weight: 0.1 },
        { name: 'searchable', weight: 0.2 },
      ],
    },
  )

  return cards.filter((card) => {
    const searchable = searchableText(card)

    return tokens.every((token) => {
      if (searchable.includes(token)) {
        return true
      }

      return fuse.search(token).some((result) => result.item.id === card.id)
    })
  })
}
