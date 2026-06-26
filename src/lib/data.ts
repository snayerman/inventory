import Papa from "papaparse";
import {
	cardConditions,
	cardStatuses,
	cardVariants,
	type CardCondition,
	type CardStatus,
	type CardVariant,
	type PokemonCard,
} from "./types";

const SHEET_ID = "1V34BMOeuv_Db_BzCQqGJD-nZiwYiXSCLsDi_QS7_tOY";
const SHEET_NAME = "Sheet1";
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

const headers = {
	name: "Name",
	set: "Set",
	number: "Number",
	variant: "Variant",
	condition: "Condition",
	pricePaid: "Price Paid (internal value - how much I paid for card)",
	price: "Price (asking price)",
	language: "Language",
	notes: "Notes",
	status: "Status",
	front: "Front",
	back: "Back",
} as const;

type SheetRow = Record<string, string | undefined>;

const shortHeaders = {
	pricePaid: "Price Paid",
	price: "Price",
} as const;

const variantSet = new Set<string>(cardVariants);
const conditionSet = new Set<string>(cardConditions);
const statusSet = new Set<string>(cardStatuses);

const variantAliases: Record<string, CardVariant> = {
	regular: "normal",
	nonholo: "normal",
	"non-holo": "normal",
	"reverse holo": "reverse",
	reverse_holo: "reverse",
};

function fallbackCell(row: SheetRow, primaryHeader: string, fallbackHeader: string): string | undefined {
	const value = row[primaryHeader];
	return value !== undefined ? value : row[fallbackHeader];
}

function isExternalImageUrl(value: unknown): value is string {
	if (typeof value !== "string" || value.trim() === "") {
		return false;
	}

	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:";
	} catch {
		return false;
	}
}

function text(value: string | undefined): string {
	return value?.trim() ?? "";
}

function optionalText(value: string | undefined): string | undefined {
	const trimmed = text(value);
	return trimmed === "" ? undefined : trimmed;
}

function parseMoney(value: string | undefined): number | undefined {
	const normalized = text(value).replace(/[$,]/g, "");

	if (normalized === "") {
		return undefined;
	}

	const parsed = Number(normalized);
	if (!Number.isFinite(parsed)) {
		return undefined;
	}

	return parsed;
}

function normalizeToken(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseVariant(value: string): CardVariant | undefined {
	const normalized = normalizeToken(value);
	const variant = variantAliases[normalized] ?? normalized;
	return variantSet.has(variant) ? (variant as CardVariant) : undefined;
}

function parseCondition(value: string | undefined): CardCondition | undefined {
	const condition = normalizeToken(value || "nm");
	return conditionSet.has(condition) ? (condition as CardCondition) : undefined;
}

function parseStatus(value: string | undefined): CardStatus | undefined {
	const status = normalizeToken(value || "available");
	return statusSet.has(status) ? (status as CardStatus) : undefined;
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function parseCard(row: SheetRow, index: number): PokemonCard | undefined {
	const rowNumber = index + 2;
	const name = text(row[headers.name]);
	const number = text(row[headers.number]);
	const variantText = text(row[headers.variant]);
	const frontImage = text(row[headers.front]);
	const backImage = text(row[headers.back]);

	if (!name || !number || !variantText) return undefined;
	if (!isExternalImageUrl(frontImage) || !isExternalImageUrl(backImage)) return undefined;

	const status = parseStatus(row[headers.status]);
	if (!status || status === "sold") return undefined;

	const variant = parseVariant(variantText);
	if (!variant) return undefined;

	const condition = parseCondition(row[headers.condition]);
	if (!condition) return undefined;

	const price = parseMoney(fallbackCell(row, headers.price, shortHeaders.price));
	if (price === undefined) return undefined;

	return {
		id: `sheet-row-${rowNumber}-${slugify(`${name}-${number}`)}`,
		name,
		set: optionalText(row[headers.set]),
		number,
		variant,
		frontImage,
		backImage,
		condition,
		language: optionalText(row[headers.language]) ?? "English",
		price,
		notes: optionalText(row[headers.notes]),
		status,
	};
}

export async function loadPokemonCards(): Promise<PokemonCard[]> {
	const response = await fetch(SHEET_CSV_URL, { cache: "no-store" });

	if (!response.ok) {
		throw new Error(`Could not load Google Sheet inventory (${response.status}).`);
	}

	const csv = await response.text();
	const parsed = Papa.parse<SheetRow>(csv, {
		header: true,
		skipEmptyLines: "greedy",
		transformHeader: (header) => header.trim(),
	});

	if (parsed.errors.length > 0) {
		throw new Error(parsed.errors[0]?.message ?? "Could not parse Google Sheet CSV.");
	}

	const cards: PokemonCard[] = [];
	for (let index = 0; index < parsed.data.length; index += 1) {
		const card = parseCard(parsed.data[index], index);
		if (card) {
			cards.push(card);
		}
	}

	return cards;
}
