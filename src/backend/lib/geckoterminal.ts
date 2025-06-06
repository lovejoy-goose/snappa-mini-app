import { CacheGetResponse } from "@gomomento/sdk-web";
import { fetcher } from "itty-fetcher";
import { z } from "zod";
import Redis from "./momento";
import invariant from "tiny-invariant";

enum Ttl {
	SimplePrice = 60 * 10, // 10 minutes
	CoinDetails = 60 * 60 * 24, // 24 hours
}

const geckoTerminalCoinDetailsResponseSchema = z.object({
	data: z.object({
		id: z.string(),
		type: z.string(),
		attributes: z.object({
			address: z.string(),
			name: z.string(),
			symbol: z.string(),
			decimals: z.number(),
			image_url: z.string().nullable(),
			coingecko_coin_id: z.string().nullable(),
			websites: z.array(z.string()),
			discord_url: z.string().nullable(),
			telegram_handle: z.string().nullable(),
			twitter_handle: z.string().nullable(),
			description: z.string().nullable(),
			gt_score: z.number(),
			gt_score_details: z.object({
				pool: z.number(),
				transaction: z.number(),
				creation: z.number(),
				info: z.number(),
				holders: z.number(),
			}),
			categories: z.array(z.string()),
			gt_category_ids: z.array(z.string()),
			holders: z.object({
				count: z.number().nullable(),
				distribution_percentage: z.object({
					top_10: z.string().nullable(),
					"11_30": z.string().nullable(),
					"31_50": z.string().nullable(),
					rest: z.string().nullable(),
				}),
				last_updated: z.string(),
			}),
			mint_authority: z.string().nullable(),
			freeze_authority: z.string().nullable(),
		}),
	}),
});

export type GeckoTerminalCoinDetails = z.infer<
	typeof geckoTerminalCoinDetailsResponseSchema
>;

export const getGeckoTerminalCoinDetails = async (
	env: Env,
	ca: string,
): Promise<z.infer<typeof geckoTerminalCoinDetailsResponseSchema> | null> => {
	invariant(env.MOMENTO_CACHE_NAME, "MOMENTO_CACHE_NAME is not set");
	
	const cacheClient = new Redis(env);
	const cacheName = env.MOMENTO_CACHE_NAME;
	const cacheKey = `geckoterminal-token-detail-${ca}`;
	const deets = await cacheClient.get(cacheName, cacheKey);

	if (deets.type === CacheGetResponse.Hit) {
		return geckoTerminalCoinDetailsResponseSchema.parse(
			JSON.parse(deets.valueString()),
		);
	}

	const api = fetcher({
		base: "https://api.geckoterminal.com/api/v2/networks/base/tokens/",
		headers: {
			accept: "application/json",
		},
	});

	try {
		const data = await api.get(`${ca}/info`);
		const validatedData = geckoTerminalCoinDetailsResponseSchema.parse(data);

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
