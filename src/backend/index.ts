import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { z } from "zod";
import { getCoingeckoCoinDetails, getCoingeckoPrice } from "./lib/coingecko";
import { getGeckoTerminalCoinDetails } from "./lib/geckoterminal";
import { getNeynarUser } from "./lib/neynar";
import {
	getHydratedCast,
	getHydratedUser,
} from "./lib/shim";
import { protectedRoutes } from "./protected";

const app = new Hono<{ Bindings: Cloudflare.Env }>().basePath("/api");

const routes = app
	.post("/webhook", async (c) => {
		const body = await c.req.json();
		console.log(body);
		return c.json({ success: true });
	})
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
	.get("/neynar-user/:fid", async (c) => {
		const { fid } = c.req.param();
		const user = await getNeynarUser(c.env, Number(fid));
		return c.json({ user });
	})
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
