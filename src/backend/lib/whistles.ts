import { CacheGetResponse } from "@gomomento/sdk-web";
import { GraphQLClient, gql } from "graphql-request";
import { keccak256 } from "js-sha3";
import invariant from "tiny-invariant";
import { type ZodObject, type ZodRawShape, z } from "zod";
import Redis, { Ttl } from "./momento";

const GRAPHQL_ENDPOINT = "https://whistles.artlu.xyz/graphql";
export const BLOCKLIST = [];

const queries: Record<string, string> = {
	getTextByCastHash: gql`
    query getTextByCastHash($castFid: Int!, $castHash: String!, $viewerFid: Int!) {
      getTextByCastHash(castFid: $castFid, castHash: $castHash, viewerFid: $viewerFid) {
        isDecrypted
        timestamp
        text
        decodedText
      }
    }
  `,
};

const mutation = gql`
  mutation WriteData(
    $fid: Int!
    $timestamp: Timestamp!
    $messageHash: String!
    $text: String!
    $hashedText: String!
  ) {
    writeData(
      input: {
        fid: $fid
        timestamp: $timestamp
        messageHash: $messageHash
        text: $text
        hashedText: $hashedText
      }
    ) {
      success
      message
    }
  }
`;

type CreateWhistleVariables = {
	fid: number;
	timestamp: string;
	messageHash: string;
	text: string;
	hashedText: string;
};

type CreateWhistleResponse = {
	writeData: {
		success: boolean;
		message: string;
	};
};

interface TextByCastHashResponse {
	getTextByCastHash: {
		isDecrypted: boolean;
		timestamp: string;
		text: string;
		decodedText: string | null;
	} | null;
}

const TextByCastHashSchema = z.object({
	getTextByCastHash: z
		.object({
			isDecrypted: z.boolean(),
			timestamp: z.string(),
			text: z.string(),
			decodedText: z.string().nullable(),
		})
		.nullable(),
});

export const getTextByCastHash = async (
	env: Env,
	castFid: number,
	castHash: string,
	viewerFid: number | null,
) => {
	invariant(env.MOMENTO_CACHE_NAME, "MOMENTO_CACHE_NAME is not set");
	invariant(env.YOGA_WHISTLES_BEARER, "YOGA_WHISTLES_BEARER is not set");

	if (!viewerFid) {
		throw new Error("Fid is required");
	}

	const cacheClient = new Redis(env);
	const cacheName = env.MOMENTO_CACHE_NAME;
	const cacheKey = `getTextByCastHash-${castFid}-${castHash}-${viewerFid}`;
	const cacheResponse = await cacheClient.get(cacheName, cacheKey);
	if (cacheResponse.type === CacheGetResponse.Hit) {
		return JSON.parse(cacheResponse.valueString()) as TextByCastHashResponse;
	}

	try {
		const res = await genericGraphQLQuery<TextByCastHashResponse>(
			"getTextByCastHash",
			TextByCastHashSchema,
			{ castFid, castHash, viewerFid },
			env.YOGA_WHISTLES_BEARER,
		);

		await cacheClient.set(
			cacheName,
			cacheKey,
			JSON.stringify(res),
			Ttl.Short, // permissions may change, so caching needs to refresh quickly
		);

		return res;
	} catch (error) {
		throw new Error(
			`Failed to get text by cast hash: ${castFid}/${castHash} for viewer ${viewerFid}: ${error}`,
		);
	}
};

// https://docs.farcaster.xyz/learn/what-is-farcaster/messages#timestamps
const UnixEpochToFarcasterEpoch = (timestampInSeconds: number) => {
	return timestampInSeconds - Number(1609459200);
};

export const writeWhistle = async (env: Env, fid: number, text: string) => {
	invariant(
		env.YOGA_WHISTLES_WRITE_TOKEN,
		"YOGA_WHISTLES_WRITE_TOKEN is not set",
	);

	const graphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
		headers: { authorization: `Bearer ${env.YOGA_WHISTLES_WRITE_TOKEN}` },
	});

	const messageHash = keccak256(`${fid}-${text}`);
	const hashedText = keccak256(text);
	const timestamp = UnixEpochToFarcasterEpoch(
		Math.floor(Date.now() / 1000),
	).toString();

	const res = await graphQLClient.request<
		CreateWhistleResponse,
		CreateWhistleVariables
	>(mutation, {
		fid,
		timestamp,
		messageHash,
		text,
		hashedText,
	});

	return res.writeData;
};

const genericGraphQLQuery = async <T>(
	queryName: string,
	schema: ZodObject<ZodRawShape>,
	variables?: Record<string, unknown>,
	bearerToken?: string,
) => {
	invariant(GRAPHQL_ENDPOINT, "GRAPHQL_ENDPOINT is not set");

	const graphQLClient = bearerToken
		? new GraphQLClient(GRAPHQL_ENDPOINT, {
				headers: { authorization: `Bearer ${bearerToken}` },
			})
		: new GraphQLClient(GRAPHQL_ENDPOINT);

	const query = queries[queryName];
	try {
		const res = await graphQLClient.request<T>(query, variables);

		const validated = schema.safeParse(res);
		if (!validated.success) {
			console.error("res:", res);
			throw new Error(`Failed to validate response: ${validated.error}`);
		}

		return validated.data as T;
	} catch (error: unknown) {
		throw new Error(
			`Failed to get ${queryName} ${
				variables ? ` on: ${JSON.stringify(variables)}` : ""
			}`,
		);
	}
};
