import { create } from "zustand";
import { combine, createJSONStorage, persist } from "zustand/middleware";
import type { Cast } from "../../shared/types";
import type { Token } from "../lib/constants";
import type { QuoteResponse } from "../lib/zeroex";

export enum ComposeMode {
	Cast = "cast",
	Reply = "reply",
	Quote = "quote",
}

interface QuoteObject extends QuoteResponse {
	signature?: string | null;
	successfulTradeHash?: string | null;
}

export const useZustand = create(
	persist(
		combine(
			{
				count: 0,
				showFees: false,
				showNerd: false,
				quoteObject: null as QuoteObject | null,
				newToken: null as Token | null,
			},
			(set) => ({
				increase: (by = 1) => set((state) => ({ count: state.count + by })),
				reset: () => set({ count: 0 }),
				toggleShowFees: () => set((state) => ({ showFees: !state.showFees })),
				toggleShowNerd: () => set((state) => ({ showNerd: !state.showNerd })),
				setQuoteObject: (quoteObject: QuoteObject | null) =>
					set({ quoteObject }),
				setNewToken: (newToken: Token | null) => set({ newToken }),
			}),
		),
		{
			name: "zustand-store",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);

export const useInMemoryZustand = create(
	combine(
		{
			jwt: null as string | null,
			secureContextFid: null as number | null,
			isLoadingWallet: true as boolean,
			warpletAddress: null as `0x${string}` | null, // this doesn't have to be warplet, it can be any wallet
			castResponse: null as Cast | null,
			composeMode: ComposeMode.Cast as ComposeMode,
		},
		(set) => ({
			setJwt: (jwt: string | null) => set({ jwt }),
			setSecureContextFid: (secureContextFid: number | null) =>
				set({ secureContextFid }),
			setIsLoadingWallet: (isLoadingWallet: boolean) =>
				set({ isLoadingWallet }),
			setWarpletAddress: (warpletAddress: `0x${string}` | null) =>
				set({ warpletAddress }),
			setCastResponse: (castResponse: Cast | null) => set({ castResponse }),
			setComposeMode: (composeMode: ComposeMode) => set({ composeMode }),
		}),
	),
);

export const useLocalStorageZustand = create(
	persist(
		combine({ mutePhrase: true as boolean }, (set) => ({
			toggleMutePhrase: () =>
				set((state) => ({ mutePhrase: !state.mutePhrase })),
		})),
		{
			name: "zustand-store",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
