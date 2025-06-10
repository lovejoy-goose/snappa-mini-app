import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { z } from "zod";
import type { DecentBookmark } from "../shared/types";
import {
	deleteDecentBookmark,
	getDecentBookmarks,
	saveDecentBookmark,
} from "./lib/decent-bookmarks";
import { getEtherscanTokenBalance } from "./lib/etherscan";
import { getHydratedUser } from "./lib/shim";
import { getTextByCastHash, writeWhistle } from "./lib/whistles";

const protectedApp = new Hono<{ Bindings: Cloudflare.Env }>().basePath("/");

export const protectedRoutes = protectedApp
	.use("*", (c, next) =>
		jwt({ secret: c.env.JWT_SECRET, alg: c.env.JWT_ALGORITHM })(c, next),
	)
	.get("/secret", async (c) => {
		const payload = c.get("jwtPayload");
		if (!payload || !payload.fid || typeof payload.fid !== "number") {
			return c.json({
				success: false,
				fid: null,
				secret: null,
				zeroex: null,
			});
		}

		return c.json({
			success: true,
			fid: payload.fid,
			secret: c.env.SECRET,
			zeroex: c.env.ZEROEX_API_KEY,
		});
	})
	.get("/decent-bookmarks", async (c) => {
		const payload = c.get("jwtPayload");
		if (!payload || !payload.fid || typeof payload.fid !== "number") {
			return c.json({
				success: false,
				bookmarks: [],
			});
		}
		const bookmarks = await getDecentBookmarks(c.env, payload.fid);
		return c.json({
			success: true,
			bookmarks,
		});
	})
	.put(
		"/decent-bookmarks",
		zValidator(
			"json",
			z.object({
				hash: z.string(),
				fid: z.number(),
			}),
		),
		async (c) => {
			const payload = c.get("jwtPayload");
			if (!payload || !payload.fid || typeof payload.fid !== "number") {
				return c.json({
					success: false,
					message: "Invalid payload",
				});
			}
			const { hash, fid } = c.req.valid("json");
			const res = await getHydratedUser(fid);
			const username = res?.user?.username;
			if (!username) {
				return c.json({
					success: false,
					message: "User not found",
				});
			}
			const bookmark: DecentBookmark = {
				fid: payload.fid,
				hash,
				username,
			};
			try {
				const res = await saveDecentBookmark(c.env, bookmark);
				return c.json({
					success: res.statusCode === 200,
					message: res.message,
				});
			} catch (error) {
				return c.json({
					success: false,
					message:
						error instanceof Error ? error.message : JSON.stringify(error),
				});
			}
		},
	)
	.delete(
		"/decent-bookmarks",
		zValidator(
			"json",
			z.object({
				hash: z.string(),
			}),
		),
		async (c) => {
			const payload = c.get("jwtPayload");
			if (!payload || !payload.fid || typeof payload.fid !== "number") {
				return c.json({
					success: false,
					message: "Invalid payload",
				});
			}
			const { hash } = c.req.valid("json");
			const res = await deleteDecentBookmark(c.env, payload.fid, hash);
			return c.json({
				success: res.statusCode === 200,
				message: res.message,
			});
		},
	)
	.post(
		"/whistle",
		zValidator(
			"json",
			z.object({
				castFid: z.number(),
				castHash: z.string(),
			}),
		),
		async (c) => {
			const payload = c.get("jwtPayload");
			if (!payload || !payload.fid || typeof payload.fid !== "number") {
				return c.json({
					success: false,
					fid: null,
					hash: null,
					text: null,
					isDecrypted: false,
				});
			}
			const { castFid, castHash } = c.req.valid("json");

			const res = await getTextByCastHash(
				c.env,
				castFid,
				castHash,
				payload.fid,
			);
			const { isDecrypted, decodedText } = res.getTextByCastHash ?? {};
			return c.json({
				success: true,
				fid: payload.fid,
				hash: castHash,
				text: decodedText,
				isDecrypted,
			});
		},
	)
	.put(
		"/whistle",
		zValidator(
			"json",
			z.object({
				text: z.string(),
			}),
		),
		async (c) => {
			const payload = c.get("jwtPayload");
			if (!payload || !payload.fid || typeof payload.fid !== "number") {
				return c.json({
					success: false,
					message: "Invalid payload",
				});
			}
			const { text } = c.req.valid("json");
			const res = await writeWhistle(c.env, payload.fid, text);
			return c.json({
				success: res.success,
				message: res.message,
			});
		},
	)
	.get("/zeroex-quote", async (c) => {
		const payload = c.get("jwtPayload");
		if (!payload || !payload.fid || typeof payload.fid !== "number") {
			return c.json({
				success: false,
				quoteResponse: null,
			});
		}
		const { endpoint, ...searchParams } = c.req.query();
		const idealizedQueryString = new URLSearchParams(searchParams).toString();

		const queryString =
			endpoint === "price"
				? idealizedQueryString.replace("taker=", "takerAddress=")
				: idealizedQueryString;

		const res = await fetch(
			`https://api.0x.org/swap/permit2/${endpoint}?${queryString}`,
			{
				headers: {
					"0x-api-key": c.env.ZEROEX_API_KEY,
					"0x-version": "v2",
				},
			},
		);
		const data = await res.json();

		return c.json({
			success: true,
			quoteResponse: data,
		});
	})
	.get(
		"/etherscan-token-balance",
		zValidator(
			"query",
			z.object({
				ca: z.string().startsWith("0x"),
				userAddress: z.string().startsWith("0x"),
			}),
		),
		async (c) => {
			const payload = c.get("jwtPayload");
			if (!payload || !payload.fid || typeof payload.fid !== "number") {
				return c.json({
					success: false,
					tokenBalance: null,
				});
			}
			const { ca, userAddress } = c.req.valid("query");
			const tokenBalance = await getEtherscanTokenBalance(
				c.env,
				ca as `0x${string}`,
				userAddress as `0x${string}`,
			);
			return c.json({
				success: true,
				tokenBalance,
			});
		},
	)
	.post("/signout", async (c) => {
		// consider adding the token to a blocklist
		// For now, just return success since the client will remove the token
		return c.json({ message: "Signed out successfully" });
	});

export type SecureAppType = typeof protectedRoutes;
