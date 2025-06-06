import { sdk } from "@farcaster/frame-sdk";
import { hc } from "hono/client";
import { useCallback, useState } from "preact/hooks";
import type { AppType } from "../../shared/routes";
import { LOCAL_DEBUGGING } from "../lib/constants";
import { useFrameSDK } from "./use-frame-sdk";
import { useInMemoryZustand } from "./use-zustand";

export const api = hc<AppType>("/").api;

const MESSAGE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

export const useSignIn = () => {
	const { context, contextFid } = useFrameSDK();
	const { setJwt, setSecureContextFid } = useInMemoryZustand();
	const [error, setError] = useState<string | null>(null);

	const signOut = useCallback(() => {
		setJwt(null);
		setSecureContextFid(null);
	}, [setJwt, setSecureContextFid]);

	const signIn = useCallback(async () => {
		if (!contextFid) {
			return;
		}
		try {
			setError(null);

			const result = !LOCAL_DEBUGGING
				? await sdk.actions.signIn({
						nonce: Math.random().toString(36).substring(2),
						notBefore: new Date().toISOString(),
						expirationTime: new Date(
							Date.now() + MESSAGE_EXPIRATION_TIME,
						).toISOString(),
						acceptAuthAddress: true,
					})
				: { signature: "0x123", message: "0x123" };

			const referrerFid =
				context?.location?.type === "cast_embed"
					? context?.location.cast.author.fid
					: null;

			const res = await api["sign-in"].$post({
				json: {
					signature: result.signature,
					message: result.message,
					fid: contextFid,
					referrerFid,
				},
			});

			if (res.status !== 200) {
				throw new Error("Sign in failed (not successful)");
			}

			const data = await res.json();

			if (!LOCAL_DEBUGGING && data.secureFid !== contextFid) {
				throw new Error("Unable to proceed due to client-side spoofing");
			}

			setJwt(data.token);
			setSecureContextFid(data.secureFid);
			return data;
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? JSON.stringify(err.message, null, 2)
					: "Sign in failed (general)";
			setError(errorMessage);
			setJwt(null);
			throw err;
		}
	}, [context, contextFid, setJwt, setSecureContextFid]);

	return {
		signIn,
		signOut,
		error,
	};
};
