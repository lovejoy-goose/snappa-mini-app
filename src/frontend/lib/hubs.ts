import { Buffer } from "buffer";
import {
	CastType,
	type Embed,
	FarcasterNetwork,
	Message,
	NobleEd25519Signer,
	ReactionType,
	makeCastAdd,
	makeReactionAdd,
} from "@farcaster/core";
import { fetcher } from "itty-fetcher";
import { hexToBytes } from "viem";
import { getHub } from "./constants";
import { getByteLength } from "./utils";

const hub = getHub("neynar");
const client = fetcher({
	base: `${hub.ssl ? "https" : "http"}://${hub.url}`,
	headers: { Accept: "application/json" },
});

export async function publishCast(params: {
	fid: number;
	pk: `0x${string}`;
	neynarApiKey: string;
	text: string;
	parentCast?: { fid: number; hash: `0x${string}` };
	embeds?: Embed[];
	mentions?: number[];
	mentionsPositions?: number[];
}) {
	const {
		fid,
		pk,
		neynarApiKey,
		text,
		parentCast,
		embeds,
		mentions,
		mentionsPositions,
	} = params;

	const signer = new NobleEd25519Signer(hexToBytes(pk));
	const postConfig = {
		headers: { "Content-Type": "application/octet-stream" },
	};

	const parentCastId = parentCast
		? {
				fid: parentCast.fid,
				hash: hexToBytes(parentCast.hash),
			}
		: undefined;
	console.log("Attempting to publish cast using @farcaster/core...");
	const dataOptions = {
		fid,
		network: FarcasterNetwork.MAINNET,
	};

	const result = await makeCastAdd(
		{
			text,
			parentCastId,
			embedsDeprecated: [],
			mentions: mentions ?? [],
			mentionsPositions: mentionsPositions ?? [],
			embeds: embeds ?? [],
			type: getByteLength(text) > 320 ? CastType.LONG_CAST : CastType.CAST,
		},
		dataOptions,
		signer,
	);

	if (result.isErr()) {
		throw new Error(`Error creating message: ${result.error}`);
	}

	console.log("created message, encoding...");
	const messageBytes = Buffer.from(Message.encode(result.value).finish());
	console.log("encoded message, sending via Neynar HTTPS Hubs API...");

	try {
		const response = await client.post<Response>(
			"/v1/submitMessage",
			messageBytes,
			{
				...postConfig,
				headers: {
					...postConfig.headers,
					"x-api-key": neynarApiKey,
				},
			},
		);
		console.log("Cast published successfully");
		return response;
	} catch (e) {
		console.error("Error publishing cast:", e);
		throw e;
	}
}

export async function likeCast(
	fid: number,
	pk: `0x${string}`,
	targetCast: {
		fid: number;
		hash: `0x${string}`;
	},
) {
	const signer = new NobleEd25519Signer(hexToBytes(pk));
	const postConfig = {
		headers: { "Content-Type": "application/octet-stream" },
	};

	console.log("Attempting to like cast using @farcaster/core...");
	const dataOptions = {
		fid,
		network: FarcasterNetwork.MAINNET,
	};
	const result = await makeReactionAdd(
		{
			targetCastId: {
				fid: targetCast.fid,
				hash: hexToBytes(targetCast.hash),
			},
			type: ReactionType.LIKE,
		},
		dataOptions,
		signer,
	);

	if (result.isErr()) {
		throw new Error(`Error creating message: ${result.error}`);
	}

	console.log("created message, encoding...");
	const messageBytes = Buffer.from(Message.encode(result.value).finish());
	console.log("encoded message, sending via Neynar HTTPS Hubs API...");

	try {
		const response = await client.post<Response>(
			"/v1/submitMessage",
			messageBytes,
			postConfig,
		);
		console.log("Cast liked successfully");
		return response;
	} catch (e) {
		console.error("Error liking cast:", e);
		throw e;
	}
}
