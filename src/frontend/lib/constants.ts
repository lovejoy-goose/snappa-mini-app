import { sift } from "radash";
import type { JWK } from "jose";

export const LOCAL_DEBUGGING = import.meta.env.DEV;
export const DEBUG_FID = 6546;

export const MAX_LENGTH = 320;
export const LONG_MAX_LENGTH = 1000;

export const jwks: { keys: JWK[] } = {
	keys: [
		{
			kty: "RSA",
			n: "wJB94rZ73yA3z8e95APlFjfQeDHL7WOKENVLKEpsb8of0f1S_soQPCjb7rdE80FDkxnRYCYDy5z2IEpRSm0jSCKxbQdUEbpevPemo_7-tyPa5F9Pg8tLcoNPUDC76B0vzmYLlglaRMDNaiFJ3wOYze9PgtLFMXqoV0Yt6JM49i2sBWuOm7_x9DgPlzsNYCY16yRMbLcgxVOjieo1SDsESvxS-PepXQu1AquhvFAdhTkKomjhqUEQeSC0J1rpuB1imKXHsegLdDm8I-GuENz5ErSRP_2z499Qj1Ehf5Pue2a8pZ0dYSQ0VzeZF1H1sfb3FjUY4gls3UyZdzE-SHoXKw",
			e: "AQAB",
			kid: "355d43bf-c4b4-45e3-82ca-8eb28c6709e5",
		},
	],
};

export const CDN_URL = "https://cdn.artlu.xyz";
export interface Image {
	id: string;
	mimeType: string;
	uploadedAt: number;
	size: number;
}
export interface ImagesResponse {
	images: Image[];
}

export const WARPLET_ADDRESS: `0x${string}` =
	"0x868d077d5ae521e972d0494486807363e9d65604";
export const FAFO_ADDRESS: `0x${string}` =
	"0x094f1608960A3cb06346cFd55B10b3cEc4f72c78";
export const BASE_USDC_ADDRESS: `0x${string}` =
	"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";

export enum ChainId {
	BASE = 8453,
}

export const MINIMUM_MINI_APP_FEE_IN_BPS = 60;
export const DEFAULT_AFFILIATE_FEE_IN_BPS = 80;

export interface Token {
	symbol: string;
	name: string;
	coingeckoId: string | null;
	image: string;
	address: `0x${string}`;
	decimals: number;
}

export const KNOWN_TOKENS: Token[] = [
	{
		symbol: "USDC",
		name: "USD Coin",
		coingeckoId: "usd-coin",
		image:
			"https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
		address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
		decimals: 6,
	},
	{
		symbol: "DEGEN",
		name: "Degen",
		coingeckoId: "degen-base",
		image:
			"https://coin-images.coingecko.com/coins/images/34515/large/android-chrome-512x512.png?1706198225",
		address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
		decimals: 18,
	},
	{
		symbol: "ETH",
		name: "Ethereum",
		coingeckoId: "ethereum",
		image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
		address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
		decimals: 18,
	},
	{
		symbol: "BURRITO",
		name: "BURROTI",
		coingeckoId: null,
		image:
			"https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/52855979-96ac-47ec-2314-658e3124ff00/original",
		address: "0x097745F2FB83C104543F93E528B455FC3cE392b6",
		decimals: 18,
	},
	{
		symbol: "CLANKER",
		name: "Clanker",
		coingeckoId: "tokenbot-2",
		image:
			"https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/295953fa-15ed-4d3c-241d-b6c1758c6200/original",
		address: "0x1bc0c42215582d5A085795f4baDbaC3ff36d1Bcb",
		decimals: 18,
	},
	{
		symbol: "lemon3",
		name: "lemon3",
		coingeckoId: null,
		image:
			"https://turquoise-blank-swallow-685.mypinata.cloud/ipfs/bafkreia5jwudb5gqe5papkbld7yad44m3y4xzjjshz5a45it6zpepwa3vu",
		address: "0xe0907762B1D9cdfBE8061aE0Cc4A0501fa077421",
		decimals: 18,
	},
];

export const ALLOWED_BASE_TOKENS = sift(
	["USDC", "ETH"].map((ks) => KNOWN_TOKENS.find((t) => t.symbol === ks)),
);

export const MUTE_PHRASE =
	"(mute the phrase '!sassy1' to stop seeing SassyHash 💅 in your feed)";
