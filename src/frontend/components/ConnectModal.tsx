import { hc } from "hono/client";
import { useEffect, useState } from "preact/hooks";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useProfiles } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import type { AppType } from "../../shared/routes";
import { useInMemoryZustand } from "../hooks/use-zustand";

export const api = hc<AppType>("/").api;

const THIRDWEB_CLIENT_ID = "63563c6683df2a84ba6974e44bbed342";
export const client = createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });

const wallets = [
	inAppWallet({
		auth: {
			options: [
				"google",
				"apple",
				"facebook",
				"x",
				"github",
				"discord",
				"telegram",
				"line",
				"coinbase",
				"farcaster",
				"email",
				"phone",
				"passkey",
				"guest",
			],
			passkeyDomain: "https://snappa-mini-app.artlu.workers.dev",
		},
		metadata: {
			name: "Snappa",
			icon: "https://snappa-mini-app.artlu.workers.dev/favicon.png",
			image: {
				alt: "Snappa",
				src: "https://snappa-mini-app.artlu.workers.dev/favicon.png",
				width: 128,
				height: 128,
			},
		},
	}),
];

export const ConnectModal = () => {
	const { setJwt, setSecureContextFid } = useInMemoryZustand();
	const { data: profiles } = useProfiles({ client });
	const thirdwebFid = profiles?.find((profile) => profile.type === "farcaster")
		?.details?.id;

	const [isDarkMode, setIsDarkMode] = useState(
		window.matchMedia("(prefers-color-scheme: dark)").matches,
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = (e: MediaQueryListEvent) => {
			setIsDarkMode(e.matches);
		};

		// Add listener for changes
		mediaQuery.addEventListener("change", handleChange);

		// Cleanup listener on component unmount
		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	useEffect(() => {
		if (thirdwebFid) {
			setSecureContextFid(Number(thirdwebFid));
		}
	}, [thirdwebFid, setSecureContextFid]);

	return (
		<ConnectButton
			client={client}
			appMetadata={{
				name: "Snappa dApp",
				url: "https://snappa-mini-app.artlu.workers.dev",
				description: "Snappa dApp",
				logoUrl: "https://snappa-mini-app.artlu.workers.dev/favicon.png",
			}}
			auth={{
				getLoginPayload: async (params) => {
					try {
						const res = await api.login.$get({
							query: {
								address: params.address,
								chainId: params.chainId?.toString(),
							},
						});
						const data = await res.json();
						if ("error" in data) {
							throw new Error(data.error);
						}
						return data;
					} catch (error) {
						console.error(error);
						throw error;
					}
				},
				doLogin: async (payload) => {
					try {
						const res = await api.login.$post({
							json: payload,
						});
						const data = await res.json();
						if ("error" in data) {
							throw new Error(data.error);
						}
						if (data.snappaJwt && data.secureFid) {
							setJwt(data.snappaJwt);
							setSecureContextFid(data.secureFid);
						}
					} catch (error) {
						console.error(error);
						throw error;
					}
				},
				doLogout: async () => {
					try {
						await api.logout.$post();
					} catch (error) {
						console.error(error);
						throw error;
					}
				},
				isLoggedIn: async () => {
					try {
						const res = await api.isLoggedIn.$get();
						const data = await res.json();
						return data.loggedIn;
					} catch (error) {
						console.error(error);
						return false;
					}
				},
			}}
			wallets={wallets}
			theme={isDarkMode ? "dark" : "light"}
		/>
	);
};
