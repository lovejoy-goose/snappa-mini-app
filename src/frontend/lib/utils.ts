import { KNOWN_TOKENS, type Token } from "./constants";

export const getByteLength = (text: string): number => {
	return new TextEncoder().encode(text).length;
};

export const pluralize = (
	count: number,
	singular: string,
	plural: string,
): string => {
	return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
};

export const formatPrice = (price: number): string => {
	if (price < 1) {
		return price.toLocaleString("en-US", {
			minimumFractionDigits: 4,
			maximumFractionDigits: 6,
		});
	}
	if (price < 100) {
		return price.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	}
	if (price > 1e4) {
		return price.toLocaleString("en-US", {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		});
	}
	return price.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 4,
	});
};

export const formatAddress = (address: `0x${string}`): string => {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const matchAddresses = (
	address1: `0x${string}` | null,
	address2: `0x${string}` | null,
): boolean => {
	return address1?.toLowerCase() === address2?.toLowerCase();
};

export const tokenSymbolToTokenObject = (symbol: string): Token | null =>
	KNOWN_TOKENS.find((t) => t.symbol === symbol) ?? null;
