import { CacheGetResponse } from "@gomomento/sdk-web";
import { fetcher } from "itty-fetcher";
import invariant from "tiny-invariant";
import { getAddress } from "viem";
import { z } from "zod";
import { ChainId } from "./../../frontend/lib/constants";
import Redis from "./momento";

enum Ttl {
	Balance = 30, // 30 seconds
}

const etherscanTokenBalanceResponseSchema = z.object({
	status: z.string(),
	message: z.string(),
	result: z.string(),
});

export type EtherscanTokenBalance = z.infer<
	typeof etherscanTokenBalanceResponseSchema
>;

export const getEtherscanTokenBalance = async (
	env: Env,
	ca: `0x${string}`,
	userAddress: `0x${string}`,
): Promise<z.infer<typeof etherscanTokenBalanceResponseSchema> | null> => {
	invariant(env.MOMENTO_CACHE_NAME, "MOMENTO_CACHE_NAME is not set");

	const cacheClient = new Redis(env);
	const cacheName = env.MOMENTO_CACHE_NAME;
	const cacheKey = `etherscan-erc20-balance-${ca}-${userAddress}`;
	const response = await cacheClient.get(cacheName, cacheKey);

	if (response.type === CacheGetResponse.Hit) {
		return etherscanTokenBalanceResponseSchema.parse(
			JSON.parse(response.valueString()),
		);
	}

	const api = fetcher({
		base: "https://api.etherscan.io/v2",
		headers: { accept: "application/json" },
	});

	try {
		const data = await api.get(
			`/api?${new URLSearchParams({
				chainId: ChainId.BASE.toString(),
				module: "account",
				action: "tokenbalance",
				contractaddress: getAddress(ca),
				address: getAddress(userAddress),
				tag: "latest",
				apikey: env.ETHERSCAN_API_KEY,
			}).toString()}`,
		);

		const validatedData = etherscanTokenBalanceResponseSchema.parse(data);

		await cacheClient.set(
			cacheName,
			cacheKey,
			JSON.stringify(validatedData),
			Ttl.Balance,
		);

		return validatedData;
	} catch (error) {
		console.error(error);
		return null;
	}
};
