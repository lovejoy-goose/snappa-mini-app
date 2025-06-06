import { z } from "zod";

export interface QuoteParams {
	chainId: number;
	sellToken: string;
	buyToken: string;
	sellAmount: string;
	buyAmount: string;
	taker: string;
	swapFeeRecipient: string;
	swapFeeBps: number;
	swapFeeToken: string;
	tradeSurplusRecipient?: string;
}

export type PriceResponse = z.infer<typeof PriceSchema>;

export type QuoteResponse = z.infer<typeof QuoteSchema>;

const HexString = z.custom<`0x${string}`>(
	(val) => typeof val === "string" && /^0x[a-fA-F0-9]+$/.test(val),
);

export const EIP712TypedDataSchema = z.object({
	types: z.record(
		z.string(),
		z.array(
			z.object({
				name: z.string(),
				type: z.string(),
			}),
		),
	),
	domain: z.object({
		name: z.string(),
		chainId: z.number(),
		version: z.string().optional(),
		verifyingContract: HexString.optional(),
	}),
	message: z.record(z.string(), z.unknown()),
	primaryType: z.string(),
});

export const PriceSchema = z.object({
	blockNumber: z.string(),
	buyAmount: z.string(),
	buyToken: HexString,
	fees: z.object({
		integratorFee: z
			.object({
				amount: z.string(),
				token: HexString,
				type: z.string(),
			})
			.nullable(),
		zeroExFee: z.object({
			amount: z.string(),
			token: HexString,
			type: z.string(),
		}),
		gasFee: z.object({
			amount: z.string(),
			token: HexString,
			type: z.string(),
		}).nullable(),
	}),
	gas: z.string(),
	gasPrice: z.string(),
	issues: z.object({
		allowance: z.object({
			actual: z.string(),
			spender: z.string(),
		}).nullable(),
		balance: z
			.object({
				token: z.string(),
				actual: z.string(),
				expected: z.string(),
			})
			.nullable(),
		simulationIncomplete: z.boolean(),
		invalidSourcesPassed: z.array(z.string()),
	}),
	liquidityAvailable: z.boolean(),
	minBuyAmount: z.string(),
	route: z.object({
		fills: z.array(
			z.object({
				from: z.string(),
				to: z.string(),
				source: z.string(),
				proportionBps: z.string(),
			}),
		),
		tokens: z.array(
			z.object({
				address: z.string(),
				symbol: z.string(),
			}),
		),
	}),
	sellAmount: z.string(),
	sellToken: z.string(),
	tokenMetadata: z.object({
		buyToken: z.object({
			buyTaxBps: z.string(),
			sellTaxBps: z.string(),
		}),
		sellToken: z.object({
			buyTaxBps: z.string(),
			sellTaxBps: z.string(),
		}),
	}),
	totalNetworkFee: z.string(),
	validationErrors: z.array(z.string()).optional(),
	permit2: z
		.object({
			type: z.string(),
			hash: HexString,
			eip712: EIP712TypedDataSchema,
		})
		.optional(),
	transaction: z
		.object({
			to: HexString,
			data: HexString,
			gas: z.string(),
			gasPrice: z.string(),
			value: z.string(),
		})
		.optional(),
	zid: z.string(),
});

export const QuoteSchema = PriceSchema.omit({
	gas: true,
	gasPrice: true,
}).extend({
	permit2: z
		.object({
			type: z.string(),
			hash: HexString,
			eip712: EIP712TypedDataSchema,
		})
		.nullable(),
	transaction: z
		.object({
			to: HexString,
			data: HexString,
			gas: z.string(),
			gasPrice: z.string(),
			value: z.string(),
		})
		.nullable(),
});

export const ErrorDataSchema = z.object({
	zid: z.string(),
	metaTransactionHash: z.string().optional(),
	taker: z.string().optional(),
	sellToken: z.string().optional(),
	sellAmount: z.string().optional(),
	minBalanceOrAllowance: z.string().optional(),
	expiry: z.string().optional(),
	signer: z.string().optional(),
	minSellAmount: z.string().optional(),
	pendingMetaTransactionHashes: z.array(z.string()).optional(),
});

export const ErrorResponseSchema = z.object({
	name: z.enum([
		"INSUFFICIENT_BALANCE_OR_ALLOWANCE",
		"INTERNAL_SERVER_ERROR",
		"INVALID_SIGNATURE",
		"INVALID_SIGNER",
		"META_TRANSACTION_EXPIRY_TOO_SOON",
		"META_TRANSACTION_INVALID",
		"META_TRANSACTION_STATUS_NOT_FOUND",
		"PENDING_TRADES_ALREADY_EXIST",
		"SELL_AMOUNT_TOO_SMALL",
		"SELL_TOKEN_NOT_AUTHORIZED_FOR_TRADE",
		"SWAP_VALIDATION_FAILED",
		"TAKER_NOT_AUTHORIZED_FOR_TRADE",
		"TOKEN_NOT_SUPPORTED",
		"UNABLE_TO_CALCULATE_GAS_FEE",
		"UNCATEGORIZED",
	]),
	message: z.string(),
	data: ErrorDataSchema,
});

export const PriceResponseSchema = z.union([PriceSchema, ErrorResponseSchema]);
export const QuoteResponseSchema = z.union([QuoteSchema, ErrorResponseSchema]);
