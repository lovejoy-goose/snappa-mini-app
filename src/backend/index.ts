import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { sign } from "hono/jwt";
import { secureHeaders } from "hono/secure-headers";
import invariant from "tiny-invariant";
import { getAddress, verifyMessage } from "viem";
import { z } from "zod";
import { getCoingeckoCoinDetails, getCoingeckoPrice } from "./lib/coingecko";
import { getGeckoTerminalCoinDetails } from "./lib/geckoterminal";
import { getNeynarUser } from "./lib/neynar";
import { getHydratedCast, getHydratedUser } from "./lib/shim";
import { thirdwebRoutes } from "./lib/thirdweb";
import { protectedRoutes } from "./protected";

const LOCAL_DEBUGGING = import.meta.env.DEV;

const app = new Hono<{ Bindings: Cloudflare.Env }>().basePath("/api");

const routes = app
	.post("/webhook", async (c) => {
		const body = await c.req.json();
		console.log(body);
		return c.json({ success: true });
	})
	.route("/", thirdwebRoutes)
	.post(
		"/local-sign-in",
		zValidator(
			"json",
			z.object({
				fid: z.number(),
			}),
		),
		async (c) => {
			const { fid } = c.req.valid("json");
			if (!LOCAL_DEBUGGING) {
				return c.json(
					{ error: "Local sign in is only available in development mode" },
					401,
				);
			}
			const token = await sign(
				{
					sub: "farcaster_user",
					iat: Math.floor(Date.now() / 1000),
					exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
					fid,
				},
				c.env.JWT_SECRET ?? "secret", // should never be the word 'secret'
				c.env.JWT_ALGORITHM,
			);
			return c.json({ success: true, token, secureFid: fid });
		},
	)
	.post(
		"/sign-in",
		zValidator(
			"json",
			z.object({
				signature: z
					.string()
					.regex(/^0x[a-fA-F0-9]+$/)
					.transform((val) => val as `0x${string}`),
				message: z.string(),
				fid: z.number(),
				referrerFid: z.number().nullable(),
			}),
		),
		async (c) => {
			const { signature, message, fid } = c.req.valid("json");
			invariant(c.env.JWT_SECRET, "JWT_SECRET is not set");
			invariant(c.env.JWT_ALGORITHM, "JWT_ALGORITHM is not set");

			const user = await getNeynarUser(c.env, fid);
			if (!user) {
				return c.json({ error: `User not found: ${fid}` }, 404);
			}

			const custodyAddress = getAddress(user.custody_address);
			const authAddresses =
				user.verified_addresses.eth_addresses.map(getAddress);
			const allAddresses = [custodyAddress, ...authAddresses.reverse()];

			// Create verification promises
			const verificationPromises = allAddresses.map((address) =>
				verifyMessage({ address, message, signature }),
			);

			// single shared promise for all-complete case
			const allCompletePromise = Promise.all(verificationPromises).then(
				(results) => results.some((r) => r === true),
			);

			// false results wait for all others
			const racingPromises = verificationPromises.map((promise) =>
				promise.then((result) => {
					if (result === true) return true;
					return allCompletePromise;
				}),
			);

			const isVerified = await Promise.race(racingPromises);

			if (!isVerified) {
				return c.json({ error: "Invalid signature" }, 401);
			}

			const token = await sign(
				{
					sub: "farcaster_user",
					iat: Math.floor(Date.now() / 1000),
					exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
					fid,
				},
				c.env.JWT_SECRET ?? "secret", // should never be the word 'secret'
				c.env.JWT_ALGORITHM,
			);
			return c.json({ success: true, token, secureFid: fid });
		},
	)
	.use(cors())
	.use(csrf())
	.use(secureHeaders())
	.get("/name", (c) => c.json({ name: c.env.NAME }))
	.get("/time", (c) => c.json({ time: new Date().toISOString() }))
	.get(
		"/coingecko-price",
		zValidator("query", z.object({ cgid: z.string() })),
		async (c) => {
			const { cgid } = c.req.valid("query");
			const price = await getCoingeckoPrice(c.env, cgid);
			return c.json(price);
		},
	)
	.get(
		"coingecko-details",
		zValidator("query", z.object({ cgid: z.string() })),
		async (c) => {
			const { cgid } = c.req.valid("query");
			const details = await getCoingeckoCoinDetails(c.env, cgid);
			return c.json(details);
		},
	)
	.get(
		"geckoterminal-details",
		zValidator(
			"query",
			z.object({
				ca: z
					.string()
					.regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
					.transform(String),
			}),
		),
		async (c) => {
			const { ca } = c.req.valid("query");
			const details = await getGeckoTerminalCoinDetails(c.env, ca);
			return c.json(details);
		},
	)
	.get(
		"/user-details",
		zValidator("query", z.object({ fid: z.string().transform(Number) })),
		async (c) => {
			const { fid } = c.req.valid("query");
			const user = await getHydratedUser(fid);
			return c.json({ ...user });
		},
	)
	.get(
		"/cast-details",
		zValidator(
			"query",
			z.object({
				fid: z.string().transform(Number),
				hash: z.string().transform(String),
			}),
		),
		async (c) => {
			const { fid, hash } = c.req.valid("query");
			const cast = await getHydratedCast(fid, `0x${hash.replace("0x", "")}`);
			return c.json({ ...cast });
		},
	)
	.route("/", protectedRoutes);

export type AppType = typeof routes;

export default app;
