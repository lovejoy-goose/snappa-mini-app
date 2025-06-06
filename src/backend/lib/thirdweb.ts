import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { createThirdwebClient } from "thirdweb";
import { type VerifyLoginPayloadParams, createAuth } from "thirdweb/auth";
import { getUser, privateKeyToAccount } from "thirdweb/wallets";
import invariant from "tiny-invariant";
import { z } from "zod";

const thirdwebClient = (env: Env) =>
	createThirdwebClient({ secretKey: env.THIRDWEB_SECRET_KEY });

export const thirdwebAuth = (env: Env) => {
	invariant(env.CLIENT_DOMAIN, "CLIENT_DOMAIN is not set");
	invariant(env.ADMIN_PRIVATE_KEY, "ADMIN_PRIVATE_KEY is not set");
	invariant(env.THIRDWEB_SECRET_KEY, "THIRDWEB_SECRET_KEY is not set");

	const client = thirdwebClient(env);
	const privateKey = env.ADMIN_PRIVATE_KEY;
	const domain = env.CLIENT_DOMAIN;
	const adminAccount = privateKeyToAccount({ client, privateKey });

	return createAuth({ domain, client, adminAccount });
};

const thirdwebApp = new Hono<{ Bindings: Cloudflare.Env }>().basePath("/");

export const thirdwebRoutes = thirdwebApp
	.get(
		"/login",
		zValidator(
			"query",
			z.object({ address: z.string(), chainId: z.string().optional() }),
		),
		async (c) => {
			const { address, chainId } = c.req.valid("query");
			if (!address) {
				return c.json({ error: "Address is required" }, 400);
			}

			const payload = await thirdwebAuth(c.env).generatePayload({
				address,
				chainId: chainId ? Number.parseInt(chainId) : undefined,
			});

			return c.json(payload);
		},
	)
	.post(
		"/login",
		zValidator(
			"json",
			z.object({
				payload: z.object({
					domain: z.string(),
					address: z.string(),
					statement: z.string(),
					uri: z.string().optional(),
					version: z.string(),
					chain_id: z.string().optional(),
					nonce: z.string(),
					issued_at: z.string(),
					expiration_time: z.string(),
					invalid_before: z.string(),
					resources: z.array(z.string()).optional(),
				}),
				signature: z.string(),
			}),
		),
		async (c) => {
			invariant(c.env.JWT_SECRET, "JWT_SECRET is not set");
			invariant(c.env.JWT_ALGORITHM, "JWT_ALGORITHM is not set");

			const payload: VerifyLoginPayloadParams = c.req.valid("json");

			const verifiedPayload = await thirdwebAuth(c.env).verifyPayload(payload);

			if (verifiedPayload.valid) {
				const user = await getUser({
					client: thirdwebClient(c.env),
					walletAddress: verifiedPayload.payload.address,
				});

				let secureFid: number | undefined;
				let snappaJwt: string | undefined;
				if (user?.profiles?.find((p) => p.type === "farcaster")) {
					secureFid = Number(
						user.profiles.find((p) => p.type === "farcaster")?.details.id,
					);

					snappaJwt = await sign(
						{
							sub: "farcaster_user",
							iat: Math.floor(Date.now() / 1000),
							exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
							fid: secureFid,
						},
						c.env.JWT_SECRET ?? "secret", // should never be the word 'secret'
						c.env.JWT_ALGORITHM,
					);

					console.log(`${user.userId} logged in as ${secureFid}`);
				}

				const jwt = await thirdwebAuth(c.env).generateJWT({
					payload: verifiedPayload.payload,
				});
				setCookie(c, "jwt", jwt);
				return c.json({ token: jwt, snappaJwt, secureFid }, 200);
			}

			return c.json({ error: "Failed to login" }, 400);
		},
	)
	.get("/isLoggedIn", async (c) => {
		const jwt = getCookie(c, "jwt");

		if (!jwt) {
			return c.json({ loggedIn: false });
		}

		const authResult = await thirdwebAuth(c.env).verifyJWT({ jwt });

		if (!authResult.valid) {
			return c.json({ loggedIn: false });
		}

		return c.json({ loggedIn: true });
	})
	.post("/logout", (c) => {
		setCookie(c, "jwt", "", {
			httpOnly: true,
			secure: true,
			sameSite: "Strict",
			maxAge: 0,
			path: "/",
		});
		return c.json({ success: true });
	});
