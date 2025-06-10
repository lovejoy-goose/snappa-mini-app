import { sdk } from "@farcaster/frame-sdk";
import { hc } from "hono/client";
import { jwtVerify } from "jose";
import { useCallback, useState } from "preact/hooks";
import type { AppType } from "../../shared/routes";
import { LOCAL_DEBUGGING, jwks } from "../lib/constants";
import { useFrameSDK } from "./use-frame-sdk";
import { useInMemoryZustand } from "./use-zustand";

export const api = hc<AppType>("/").api;

export const useSignIn = () => {
	const { contextFid } = useFrameSDK();
	const { setJwt, setSecureContextFid } = useInMemoryZustand();
	const [error, setError] = useState<string | null>(null);

	const signOut = useCallback(() => {
		setJwt(null);
		setSecureContextFid(null);
	}, [setJwt, setSecureContextFid]);

	const signIn = useCallback(async () => {
		try {
			setError(null);

			if (!LOCAL_DEBUGGING) {
				if (!contextFid) {
					throw new Error(
						"No FID found. Please make sure you're logged into Fartcaster.",
					);
				}
			}

			const { token } = !LOCAL_DEBUGGING
				? await sdk.quickAuth.getToken()
				: { token: "0x123" };

			setJwt(token ?? null);
			// verify the jwt on client side
			if (token) {
				const { payload } = await jwtVerify(token, jwks.keys[0]);
				setSecureContextFid(payload?.sub ? Number(payload.sub) : null);
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? JSON.stringify(err.message, null, 2)
					: "Sign in failed (general)";
			setError(errorMessage);
			setJwt(null);
			throw err;
		}
	}, [contextFid, setJwt, setSecureContextFid]);

	return {
		signIn,
		signOut,
		error,
	};
};
