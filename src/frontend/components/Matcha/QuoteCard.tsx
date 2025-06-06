import { useMemo, useState } from "preact/hooks";
import { useFrameSDK } from "../../hooks/use-frame-sdk";
import { useInMemoryZustand } from "../../hooks/use-zustand";
import type { Token } from "../../lib/constants";
import { formatAddress, formatPrice } from "../../lib/utils";
import type { PriceResponse, QuoteResponse } from "../../lib/zeroex";

type QuoteCardProps = {
	sellToken: Token;
	buyToken: Token;
	sellAmt: number;
	buyAmt: number;
	warpletAddress: `0x${string}` | null;
	isQuoteLoading: boolean;
	pq: PriceResponse | QuoteResponse | undefined;
	setIsSellAmountModalOpen: (open: boolean) => void;
	handleReverseQuote: () => void;
};

export const QuoteCard = ({
	sellToken,
	buyToken,
	sellAmt,
	buyAmt,
	warpletAddress,
	isQuoteLoading,
	pq,
	setIsSellAmountModalOpen,
	handleReverseQuote,
}: QuoteCardProps) => {
	const [invert, setInvert] = useState(false);
	const { jwt } = useInMemoryZustand();
	const { openUrl } = useFrameSDK();

	const priceFormatted = useMemo(() => {
		const ratio = buyAmt / sellAmt;
		return formatPrice(invert ? 1 / ratio : ratio);
	}, [sellAmt, buyAmt, invert]);

	return (
		<div className="card bg-base-200 shadow-sm overflow-hidden">
			<div className="card-title p-2">
				Quote:{" "}
				{isQuoteLoading ? null : (
					<span
						onClick={() => setInvert(!invert)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setInvert(!invert);
							}
						}}
						className="truncate"
					>
						<span className="italic mx-2">{priceFormatted}</span>
						{invert
							? `${sellToken.symbol}/${buyToken.symbol}`
							: `${buyToken.symbol}/${sellToken.symbol}`}
					</span>
				)}
			</div>
			<div className="card-body">
				{isQuoteLoading || !jwt || !warpletAddress ? (
					<div className="flex flex-col items-center gap-2">
						<div className="loading loading-spinner loading-md" />
						<div className="text-sm text-base-content/70">
							{!jwt && "Waiting for authentication..."}
							{!warpletAddress && "Waiting for wallet connection..."}
							{jwt && warpletAddress && "Fetching quote..."}
						</div>
					</div>
				) : pq ? (
					<div className="flex flex-col">
						<div className="flex items-center gap-4 bg-base-200">
							<div className="flex-1">
								<div className="text-sm opacity-70">Sell Amount</div>
								<div className="text-2xl font-bold truncate">
									<button
										type="button"
										onClick={() => setIsSellAmountModalOpen(true)}
										className="hover:opacity-80 truncate"
									>
										{formatPrice(sellAmt)}
									</button>
								</div>
								<div className="mt-1 truncate">{sellToken.symbol}</div>
							</div>
							<div className="">
								<button
									type="button"
									className="btn btn-round btn-ghost"
									onClick={handleReverseQuote}
									disabled={true}
									aria-label="reverse quote"
								>
									<i className="ri-arrow-right-line text-2xl" />
								</button>
							</div>
							<div className="flex-1">
								<div className="text-sm opacity-70">Buy Amount</div>
								<div className="text-2xl font-bold truncate">
									{formatPrice(buyAmt)}
								</div>
								<div className="mt-1">
									<span className="block truncate">${buyToken.symbol}</span>
									<span
										className="text-xs block truncate"
										onClick={() =>
											openUrl(`https://basescan.org/token/${buyToken.address}`)
										}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												openUrl(
													`https://basescan.org/token/${buyToken.address}`,
												);
											}
										}}
									>
										{formatAddress(buyToken.address)}
									</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="alert alert-error">
						<i className="ri-close-circle-line text-2xl" />
						<span>Failed to fetch quote. Please try again.</span>
					</div>
				)}
			</div>
		</div>
	);
};
