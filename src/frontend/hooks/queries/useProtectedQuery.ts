import { useMutation, useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import type { SecureAppType } from "../../../shared/routes";
import type { DecentBookmark } from "../../../shared/types";
import type { QuoteParams } from "../../lib/zeroex";
import {
	PriceResponseSchema,
	PriceSchema,
	QuoteResponseSchema,
	QuoteSchema,
} from "../../lib/zeroex";

const secureApi = (jwt: string) =>
	hc<SecureAppType>("/api", {
		headers: {
			Authorization: `Bearer ${jwt}`,
		},
	});

export const useProtectedQuery = (jwt: string | null) => {
	return useQuery({
		queryKey: ["protected", jwt],
		queryFn: async () => {
			const res = await secureApi(jwt ?? "try-a-spoof-jwt-token").secret.$get();
			return res.json();
		},
		retry: 1,
		enabled: !!jwt,
	});
};

export const useWhistleQuery = (
	jwt: string | null,
	castFid: number,
	castHash: string,
) => {
	return useQuery({
		queryKey: ["whistle", jwt, castFid, castHash],
		queryFn: async () => {
			const res = await secureApi(jwt ?? "try-a-spoof-jwt-token").whistle.$post(
				{
					json: {
						castFid,
						castHash,
					},
				},
			);
			return res.json();
		},
		retry: 1,
		enabled: !!jwt,
	});
};

export const useWriteWhistleQuery = (jwt: string | null, text: string) => {
	return useMutation<{ success: boolean; message: string }, Error, void>({
		mutationFn: async (): Promise<{ success: boolean; message: string }> => {
			const res = await secureApi(jwt ?? "try-a-spoof-jwt-token").whistle.$put({
				json: {
					text,
				},
			});
			return res.json();
		},
		retry: 0,
	});
};

export const useDecentBookmarksQuery = (jwt: string | null) => {
	return useQuery({
		queryKey: ["decent-bookmarks", jwt],
		queryFn: async () => {
			const res = await secureApi(jwt ?? "try-a-spoof-jwt-token")[
				"decent-bookmarks"
			].$get({});
			return res.json();
		},
		retry: 1,
		enabled: !!jwt,
	});
};

export const useSaveDecentBookmarkQuery = (jwt: string | null) => {
	return useMutation<
		{ success: boolean; message: string },
		Error,
		DecentBookmark
	>({
		mutationFn: async (
			bookmark: DecentBookmark,
		): Promise<{ success: boolean; message: string }> => {
			const res = await secureApi(jwt ?? "try-a-spoof-jwt-token")[
				"decent-bookmarks"
			].$put({ json: bookmark });
			return res.json();
		},
		retry: 0,
	});
};

export const useAddDecentBookmarkQuery = (jwt: string | null) => {
	return useMutation<
		{ success: boolean; message: string },
		Error,
		{
			fid: number;
			hash: string;
		}
	>({
		mutationFn: async ({
			fid,
			hash,
		}: {
			fid: number;
			hash: string;
		}): Promise<{ success: boolean; message: string }> => {
			const res = await secureApi(jwt ?? "try-a-spoof-jwt-token")[
				"decent-bookmarks"
			].$put({ json: { fid, hash } });
			return res.json();
		},
		retry: 0,
	});
};

export const useDeleteDecentBookmarkQuery = (jwt: string | null) => {
	return useMutation<{ success: boolean; message: string }, Error, string>({
		mutationFn: async (
			hash: string,
		): Promise<{ success: boolean; message: string }> => {
			const res = await secureApi(jwt ?? "try-a-spoof-jwt-token")[
				"decent-bookmarks"
			].$delete({ json: { hash } });
			return res.json();
		},
		retry: 0,
	});
};

export const useZeroExPriceQuery = (
	jwt: string | null,
	feeInBps: number,
	params: QuoteParams,
) => {
	return useQuery({
		queryKey: ["zeroex-price", jwt, feeInBps, params],
		queryFn: async () => {
			const res = await secureApi(jwt ?? "try-a-spoof-jwt-token")[
				"zeroex-quote"
			].$get({
				query: { endpoint: "price", ...params },
			});
			const data = await res.json();
			const goodOrBad = PriceResponseSchema.parse(data.quoteResponse);
			if ("name" in goodOrBad) {
				throw new Error(goodOrBad.message);
			}
			const good = PriceSchema.parse(data.quoteResponse);
			return good;
		},
		retry: 1,
		enabled: !!jwt && !!params.taker && !!params.sellAmount,
		staleTime: 1000 * 30, // 30 seconds
		placeholderData: (previousData) => previousData,
	});
};

export const useZeroExQuoteQuery = (
	jwt: string | null,
	feeInBps: number,
	params: QuoteParams,
) => {
	return useQuery({
		queryKey: ["zeroex-quote", jwt, feeInBps, params],
		queryFn: async () => {
			const res = await secureApi(jwt ?? "try-a-spoof-jwt-token")[
				"zeroex-quote"
			].$get({
				query: { endpoint: "quote", ...params },
			});
			const data = await res.json();
			const goodOrBad = QuoteResponseSchema.parse(data.quoteResponse);
			if ("name" in goodOrBad) {
				throw new Error(goodOrBad.message);
			}
			const good = QuoteSchema.parse(data.quoteResponse);
			return good;
		},
		retry: 1,
		enabled: false, // We'll manually trigger this query
	});
};
