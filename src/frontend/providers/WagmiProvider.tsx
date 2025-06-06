import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { WagmiProvider, createConfig, webSocket } from "wagmi";
import { base } from "wagmi/chains";

export const config = createConfig({
	chains: [base],
	transports: {
		[base.id]: webSocket("wss://base-rpc.publicnode.com"),
	},
	connectors: [farcasterFrame()],
});

export default function Provider({ children }: { children: React.ReactNode }) {
	return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
