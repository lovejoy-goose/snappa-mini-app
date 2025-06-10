import { useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import invariant from "tiny-invariant";
import type { AppType } from "../../../shared/routes";

export const api = hc<AppType>("/").api;

export const useNameQuery = () => {
	return useQuery({
		queryKey: ["name"],
		queryFn: async () => {
			const res = await api.name.$get();
			return res.json();
		},
	});
};

export const useTimeQuery = () => {
	return useQuery({
		queryKey: ["time"],
		queryFn: async () => {
			const res = await api.time.$get();
			return res.json();
		},
		refetchInterval: 5000, // Auto-refresh every 5 seconds
	});
};

export const useUserDetailsQuery = (fid: number | null) => {
	return useQuery({
		queryKey: ["user-details", fid],
		queryFn: async () => {
			invariant(fid, "FID is required");
			const res = await api["user-details"].$get({
				query: { fid: fid.toString() },
			});
			return res.json();
		},
		enabled: !!fid,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
		refetchOnWindowFocus: false, // Don't refetch when window regains focus
		refetchOnMount: false, // Don't refetch when component mounts
	});
};

export const useCastDetailsQuery = (
	fid: number | null,
	hash: `0x${string}` | null,
) => {
	return useQuery({
		queryKey: ["cast-details", fid, hash],
		queryFn: async () => {
			invariant(fid, "FID is required");
			invariant(hash, "Hash is required");
			const res = await api["cast-details"].$get({
				query: { fid: fid.toString(), hash },
			});
			return res.json();
		},
		enabled: !!fid && !!hash,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
		refetchOnWindowFocus: false, // Don't refetch when window regains focus
		refetchOnMount: false, // Don't refetch when component mounts
	});
};

export const useCastDetailsByUsernameShortHashQuery = (
	username: string,
	shortHash: `0x${string}`,
) => {
	return useQuery({
		queryKey: ["cast-details-by-username-short-hash", username, shortHash],
		queryFn: async () => {
			invariant(username, "Username is required");
			invariant(shortHash, "Short hash is required");
			const res = await api["cast-by-username-short-hash"].$get({
				query: { username, shortHash },
			});
			return res.json();
		},
		enabled: !!username && !!shortHash,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
		refetchOnWindowFocus: false, // Don't refetch when window regains focus
		refetchOnMount: false, // Don't refetch when component mounts
	});
};

export const useCoingeckoPriceQuery = (cgid: string | null) => {
	return useQuery({
		queryKey: ["coingecko-price", cgid],
		queryFn: async () => {
			if (!cgid) {
				throw new Error("CGID is required");
			}
			const res = await api["coingecko-price"].$get({ query: { cgid } });
			return res.json();
		},
		enabled: !!cgid,
	});
};

export const useGeckoTerminalCoinDetailsQuery = (ca: string | null) => {
	return useQuery({
		queryKey: ["gecko-terminal-coin-details", ca],
		queryFn: async () => {
			if (!ca) {
				throw new Error("CA is required");
			}
			const res = await api["geckoterminal-details"].$get({ query: { ca } });
			const data = await res.json();
			return data?.data ?? null;
		},
		enabled: !!ca && !!ca.match(/^0x[A-Fa-f0-9]{40}$/),
	});
};
