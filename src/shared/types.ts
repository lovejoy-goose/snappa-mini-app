import type { GeckoTerminalCoinDetails } from "../backend/lib/geckoterminal";
import type { JWTPayload } from "jose";

export type { GeckoTerminalCoinDetails };

// Decent Bookmarks types
export interface DecentBookmark {
	fid: number;
	username: string;
	hash: string;
}

// shim types
export interface User {
	fid: number;
	username: string | null;
	displayName: string | null;
	pfpUrl: string | null;
	bio: string | null;
	primaryAddress: `0x${string}` | null;
	proNft: { order: number; timestamp: number } | null;
}

export interface Cast {
	fid: number;
	hash: `0x${string}`;
	text: string | null;
	rawText: string | null;
	embeds: {
		url?: string;
		castId?: {
			fid: number;
			hash: `0x${string}`;
		};
	}[];
	mentions: number[];
	mentionsPositions: number[];
	parentCastId?: {
		fid: number;
		hash: `0x${string}`;
	};
	parentUrl?: string;
	timestamp: number;
	signer: `0x${string}`;
}
