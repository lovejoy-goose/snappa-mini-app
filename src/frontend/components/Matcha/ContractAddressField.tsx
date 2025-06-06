import { useEffect, useState } from "preact/hooks";
import { useGeckoTerminalCoinDetailsQuery } from "../../hooks/queries/useOpenQuery";
import { useZustand } from "../../hooks/use-zustand";
import { formatAddress } from "../../lib/utils";
import { CoinDetailsModal } from "./CoinDetailsModal";

// DRB: 0x3ec2156D4c0A9CBdAB4a016633b7BcF6a8d68Ea2
export const ContractAddressField = () => {
	const [ca, setCa] = useState<string | null>(null);
	const { data: coinDetails } = useGeckoTerminalCoinDetailsQuery(ca);
	const [isCoinDetailsModalOpen, setIsCoinDetailsModalOpen] = useState(false);
	const { setNewToken } = useZustand();

	const handleClear = () => {
		setCa("");
		setIsCoinDetailsModalOpen(false);
	};

	const handleSetNewToken = () => {
		if (!coinDetails) return;
		const attributes = coinDetails.attributes;
		if (!attributes) return;

		setNewToken({
			symbol: attributes.symbol,
			name: attributes.name,
			coingeckoId: attributes.coingecko_coin_id,
			image: attributes.image_url ?? "",
			address: `0x${ca?.replace("0x", "")}` as `0x${string}`,
			decimals: attributes.decimals,
		});
		setIsCoinDetailsModalOpen(false);
	};

	// Show modal when we have coin details
	useEffect(() => {
		if (coinDetails) {
			setIsCoinDetailsModalOpen(true);
		}
	}, [coinDetails]);

	return (
		<div className="absolute top-20 left-8 w-7/8">
			<div className="relative flex items-center w-full">
				<input
					type="text"
					className="input w-full pr-10 text-end border-none focus:border-none"
					required
					placeholder="paste CA here"
					pattern="0x[A-Fa-f0-9]{40}"
					minlength={42}
					maxlength={42}
					value={ca ? formatAddress(ca as `0x${string}`) : ""}
					onChange={(e) => setCa(e.currentTarget.value)}
					title="Must be a valid contract address on Base"
				/>
				{ca && (
					<>
						<button
							type="button"
							className="btn btn-ghost btn-sm btn-circle"
							onClick={handleClear}
							title="Clear input"
						>
							<i className="ri-close-line text-xl text-base-content/50" />
						</button>

						<button
							type="button"
							className="btn btn-ghost btn-sm btn-circle"
							disabled={!ca}
							onClick={() => setIsCoinDetailsModalOpen(true)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setIsCoinDetailsModalOpen(true);
								}
							}}
						>
							<i className="ri-eye-line text-lg text-base-content/70" />
						</button>
					</>
				)}
			</div>
			<CoinDetailsModal
				coinDetails={coinDetails ? { data: coinDetails } : null}
				isOpen={isCoinDetailsModalOpen}
				onClose={() => {
					handleSetNewToken();
					setIsCoinDetailsModalOpen(false);
				}}
			/>
		</div>
	);
};
