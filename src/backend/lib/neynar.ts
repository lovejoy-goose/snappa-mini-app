import { CacheGetResponse } from "@gomomento/sdk-web";
import type { BulkUsersResponse } from "@neynar/nodejs-sdk/build/api";
import { fetcher } from "itty-fetcher";
import invariant from "tiny-invariant";
import Redis, { Ttl } from "./momento";

const client = fetcher({ base: "https://api.neynar.com/v2/farcaster" });

const cachedFetcherGet = async <T>(
	env: Env,
	url: string,
	ttl: Ttl = Ttl.Medium,
	experimental = false,
) => {
	invariant(env.MOMENTO_CACHE_NAME, "MOMENTO_CACHE_NAME is not set");
	invariant(env.NEYNAR_API_KEY, "NEYNAR_API_KEY is not set");

	const cacheClient = new Redis(env);
	const cacheName = env.MOMENTO_CACHE_NAME;
	const cacheKey = `neynar:${url}`;
	const cacheResponse = await cacheClient.get(cacheName, cacheKey);

	if (cacheResponse.type === CacheGetResponse.Hit) {
		return JSON.parse(cacheResponse.valueString()) as T;
	}

	const res = await client.get(url, undefined, {
		headers: {
			"x-api-key": env.NEYNAR_API_KEY,
			"x-neynar-experimental": experimental ? "true" : "false",
		},
	});

	await cacheClient.set(cacheName, cacheKey, JSON.stringify(res), ttl);

	return res as T;
};

export const getNeynarUser = async (env: Env, fid: number) => {
	invariant(env.NEYNAR_API_KEY, "NEYNAR_API_KEY is not set");

	try {
		const res = await cachedFetcherGet<BulkUsersResponse>(
			env,
			`/user/bulk?fids=${fid}`,
		);
		const user = res.users[0];

		return user;
	} catch (error) {
		console.error("Error fetching user info:", error);
		return undefined;
	}
};
