import Fuse from "fuse.js";
import type { PokemonCard } from "./types";

interface IndexedCard {
	card: PokemonCard;
	searchable: string;
}

export interface CardSearcher {
	search(query: string): PokemonCard[];
}

function normalize(value: string): string {
	return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function searchableText(card: PokemonCard): string {
	return normalize(
		[card.name, card.number, card.set ?? "", card.variant, card.condition, card.language, card.notes ?? ""].join(" "),
	);
}

function queryTokens(query: string): string[] {
	return normalize(query).split(" ").filter(Boolean);
}

export function createCardSearcher(cards: PokemonCard[]): CardSearcher {
	const indexed: IndexedCard[] = cards.map((card) => ({
		card,
		searchable: searchableText(card),
	}));

	const fuse = new Fuse(indexed, {
		threshold: 0.25,
		ignoreLocation: true,
		keys: [
			{ name: "searchable", weight: 0.6 },
			{ name: "card.name", weight: 0.3 },
			{ name: "card.number", weight: 0.1 },
		],
	});

	return {
		search(query: string) {
			const tokens = queryTokens(query);

			if (tokens.length === 0) {
				return cards;
			}

			const fuzzyIdsPerToken = tokens.map(
				(token) => new Set(fuse.search(token).map((result) => result.item.card.id)),
			);

			return indexed
				.filter(({ card, searchable }) =>
					tokens.every((token, index) => searchable.includes(token) || fuzzyIdsPerToken[index].has(card.id)),
				)
				.map((entry) => entry.card);
		},
	};
}
