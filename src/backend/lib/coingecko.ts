import { CacheGetResponse } from "@gomomento/sdk-web";
import { fetcher } from "itty-fetcher";
import { z } from "zod";
import invariant from "tiny-invariant";
import Redis from "./momento";

enum Ttl {
	SimplePrice = 60 * 10, // 10 minutes
	CoinDetails = 60 * 60 * 24, // 24 hours
}

const coingeckoSimplePriceResponseSchema = z.record(
	z.object({
		usd: z.number(),
	}),
);

const coingeckoCoinDetailsResponseSchema = z.object({
	id: z.string(),
	symbol: z.string(),
	name: z.string(),
	platforms: z.record(z.string(), z.string()),
	detail_platforms: z.record(
		z.string(),
		z.object({
			decimal_place: z.number().nullable(),
			contract_address: z.string().nullable(),
		}),
	),
	categories: z.array(z.string()),
	description: z.object({
		en: z.string(),
	}),
	links: z.object({
		homepage: z.array(z.string()),
		whitepaper: z.string(),
		blockchain_site: z.array(z.string()),
		official_forum_url: z.array(z.string()),
		twitter_screen_name: z.string(),
		telegram_channel_identifier: z.string(),
		repos_url: z.object({
			github: z.array(z.string()),
			bitbucket: z.array(z.string()),
		}),
	}),
	image: z.object({
		thumb: z.string(),
		small: z.string(),
		large: z.string(),
	}),
	genesis_date: z.string().nullable(),
	market_data: z.object({
		ath: z.record(z.string(), z.number()),
		ath_change_percentage: z.record(z.string(), z.number()),
		ath_date: z.record(z.string(), z.string()),
		market_cap: z.record(z.string(), z.number()),
		market_cap_rank: z.number(),
		fully_diluted_valuation: z.record(z.string(), z.number()),
		market_cap_fdv_ratio: z.number(),
		total_supply: z.number(),
		max_supply: z.number().nullable(),
		circulating_supply: z.number(),
		community_data: z.object({
			facebook_likes: z.number().nullable(),
			twitter_followers: z.number().nullable(),
			telegram_channel_user_count: z.number().nullable(),
		}).optional(),
	}),
});

export const getCoingeckoPrice = async (
	env: Env,
	cgid: string,
): Promise<number | null> => {
	invariant(env.MOMENTO_CACHE_NAME, "MOMENTO_CACHE_NAME is not set");
	invariant(env.COINGECKO_API_KEY, "COINGECKO_API_KEY is not set");

	const cacheClient = new Redis(env);
	const cacheName = env.MOMENTO_CACHE_NAME;
	const cacheKey = `coingecko:${cgid}`;
	const price = await cacheClient.get(cacheName, cacheKey);

	if (price.type === CacheGetResponse.Hit) {
		return Number(price.valueString());
	}

	const api = fetcher({
		base: "https://api.coingecko.com/api/v3/",
		headers: {
			accept: "application/json",
			"x-cg-demo-api-key": env.COINGECKO_API_KEY,
		},
	});

	try {
		const data = await api.get(`simple/price?ids=${cgid}&vs_currencies=usd`);
		const validatedData = coingeckoSimplePriceResponseSchema.parse(data);
		const price = validatedData[cgid].usd;

		await cacheClient.set(
			cacheName,
			cacheKey,
			price.toString(),
			Ttl.SimplePrice,
		);

		return price;
	} catch (error) {
		console.error(error);
		return null;
	}
};

export const getCoingeckoCoinDetails = async (
	env: Env,
	cgid: string,
): Promise<z.infer<typeof coingeckoCoinDetailsResponseSchema> | null> => {
	invariant(env.MOMENTO_CACHE_NAME, "MOMENTO_CACHE_NAME is not set");
	invariant(env.COINGECKO_API_KEY, "COINGECKO_API_KEY is not set");

	const cacheClient = new Redis(env);
	const cacheName = env.MOMENTO_CACHE_NAME;
	const cacheKey = `token-detail-${cgid}`;
	const deets = await cacheClient.get(cacheName, cacheKey);

	if (deets.type === CacheGetResponse.Hit) {
		return coingeckoCoinDetailsResponseSchema.parse(
			JSON.parse(deets.valueString()),
		);
	}

	const api = fetcher({
		base: "https://api.coingecko.com/api/v3/",
		headers: {
			accept: "application/json",
			"x-cg-demo-api-key": env.COINGECKO_API_KEY,
		},
	});

	try {
		const data = await api.get(`coins/${cgid}`);
		const validatedData = coingeckoCoinDetailsResponseSchema.parse(data);

		await cacheClient.set(
			cacheName,
			cacheKey,
			JSON.stringify(validatedData),
			Ttl.CoinDetails,
		);

		return validatedData;
	} catch (error) {
		console.error(error);
		return null;
	}
};
