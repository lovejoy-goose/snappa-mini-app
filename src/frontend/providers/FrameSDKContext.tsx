import type { Context } from "@farcaster/frame-sdk";
import { sdk } from "@farcaster/frame-sdk";
import { createContext } from "preact";
import type { ReactNode } from "preact/compat";
import { useCallback, useEffect, useState } from "preact/hooks";
import { DEBUG_FID, LOCAL_DEBUGGING } from "../lib/constants";

export interface FrameSDKContextType {
	isSDKLoaded: boolean;
	sdk: typeof sdk;
	context: Context.FrameContext | undefined;
	castMetadata: Context.MiniappCast | undefined;
	contextName: string;
	contextFid: number | null;
	clientName: string;
	isWarpcast: boolean;
	isInstalled: boolean;
	ethProvider: typeof sdk.wallet.ethProvider;
	openUrl: (url: string) => void;
	viewProfile: (fid: number, username?: string) => void;
	composeCast: (
		text?: string,
		parent?: { type: "cast"; hash: string },
		embeds?: [] | [string] | [string, string],
	) => Promise<void>;
	connectedWallet: () => Promise<`0x${string}`>;
}

export const FrameSDKContext = createContext<FrameSDKContextType | undefined>(
	undefined,
);

export function FrameSDKProvider({ children }: { children: ReactNode }) {
	const [isSDKLoaded, setIsSDKLoaded] = useState(false);
	const [context, setContext] = useState<Context.FrameContext>();
	const [castMetadata, setCastMetadata] = useState<Context.MiniappCast>();

	const contextName =
		context?.user?.displayName ?? context?.user?.username ?? "Fartcaster";
	const contextFid = context?.user?.fid ?? (LOCAL_DEBUGGING ? DEBUG_FID : null);

	const clientName = context
		? context.client?.clientFid === 9152
			? "Warpcast"
			: (context.client?.clientFid.toString() ?? "alt client")
		: "browser";

	const isWarpcast = context?.client?.clientFid === 9152;
	const isInstalled = context?.client?.added ?? false;

	useEffect(() => {
		if (context?.location?.type === "cast_share") {
			setCastMetadata(context.location.cast);
		}
	}, [context]);

	useEffect(() => {
		const load = async () => {
			setContext(await sdk.context);
			sdk.actions.ready({});
		};

		if (sdk && !isSDKLoaded) {
			setIsSDKLoaded(true);
			load();
		}
	}, [isSDKLoaded]);

	const openUrl = useCallback(
		(url: string) => {
			context ? sdk.actions.openUrl(url) : window.open(url, "_blank");
		},
		[context],
	);

	const viewProfile = useCallback(
		(fid: number, username?: string) => {
			const profileUrl = username
				? `https://farcaster.xyz/${username}`
				: `https://vasco.wtf/fid/${fid}`;

			isWarpcast
				? sdk.actions.viewProfile({ fid })
				: context
					? sdk.actions.openUrl(profileUrl)
					: window.open(profileUrl, "_blank");
		},
		[context, isWarpcast],
	);

	const composeCast = useCallback(
		async (
			text?: string,
			parent?: {
				type: "cast";
				hash: string;
			},
			embeds?: [] | [string] | [string, string],
		) => {
			const embedsStr = embeds
				? `&${embeds
						.map((embed) => `embeds[]=${encodeURIComponent(embed)}`)
						.join("&")}`
				: "";
			context
				? await sdk.actions.composeCast({ text, parent, embeds })
				: window.open(
						`https://farcaster.xyz/~/compose?text=${encodeURIComponent(text ?? "Fartcaster")}${parent ? `&parentCastHash=${parent.hash}` : ""}${embedsStr}`,
						"_blank",
					);
		},
		[context],
	);

	const connectedWallet = useCallback(async () => {
		const accounts = await sdk.wallet.ethProvider.request({
			method: "eth_requestAccounts",
		});
		return accounts[0] as `0x${string}`;
	}, []);

	return (
		<FrameSDKContext.Provider
			value={{
				isSDKLoaded,
				sdk,
				context,
				castMetadata,
				contextName,
				contextFid,
				clientName,
				isWarpcast,
				isInstalled,
				openUrl,
				viewProfile,
				composeCast,
				ethProvider: sdk.wallet.ethProvider,
				connectedWallet,
			}}
		>
			{children}
		</FrameSDKContext.Provider>
	);
}
