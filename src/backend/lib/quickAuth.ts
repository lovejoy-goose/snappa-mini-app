import { Errors, createClient } from "@farcaster/quick-auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { JWTPayload } from "jose";

const quickAuthClient = createClient();

export const quickAuthMiddleware = createMiddleware<{
	Bindings: Cloudflare.Env;
	Variables: { jwtPayload: JWTPayload };
}>(async (c, next) => {
	const authorization = c.req.header("Authorization");
	if (!authorization || !authorization.startsWith("Bearer ")) {
		throw new HTTPException(401, {
			message: "Missing authorization bearer token",
		});
	}
	try {
		const token = authorization.split(" ")[1] as string;
		const payload = await quickAuthClient.verifyJwt({
			token,
			domain: c.env.CLIENT_DOMAIN,
		});
		c.set("jwtPayload", payload);
	} catch (error) {
		if (error instanceof Errors.InvalidTokenError) {
			throw new HTTPException(401, { message: "Invalid token" });
		}
		throw error;
	}
	await next();
});
