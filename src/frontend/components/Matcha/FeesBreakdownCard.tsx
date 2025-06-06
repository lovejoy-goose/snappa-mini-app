import { formatUnits, parseUnits } from "viem";
import { useFrameSDK } from "../../hooks/use-frame-sdk.tsx";
import { KNOWN_TOKENS } from "../../lib/constants";
import { formatAddress, formatPrice, matchAddresses } from "../../lib/utils";
import type { PriceResponse, QuoteResponse } from "../../lib/zeroex";

const addressToToken = (address: `0x${string}`) => {
	return KNOWN_TOKENS.find((t) => matchAddresses(t.address, address));
};

interface FeesBreakdownCardProps {
	pq: PriceResponse | QuoteResponse | undefined;
	setIsPayAsYouWishModalOpen: (isOpen: boolean) => void;
}

export const FeesBreakdownCard = ({
	pq,
	setIsPayAsYouWishModalOpen,
}: FeesBreakdownCardProps) => {
	const { openUrl } = useFrameSDK();
	const { token: feeToken, amount: feeAmount } = pq?.fees.zeroExFee ?? {};
	const { token: gasToken, amount: gasAmount } = pq?.fees.gasFee ?? {};
	const { token: integratorFeeToken, amount: integratorFeeAmount } =
		pq?.fees.integratorFee ?? {};

	if (!pq) {
		return null;
	}

	return pq.fees ? (
		<>
			<div className="card bg-base-200 shadow-sm">
				<h2 className="card-title mx-8">
					Fees Breakdown <i className="ri-arrow-right-long-line" />
				</h2>
				<div className="card-body">
					<div className="stats shadow">
						<div className="stat">
							<div className="stat-title">Snappa Fee</div>
							<div
								className="stat-value"
								onClick={() => setIsPayAsYouWishModalOpen(true)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										setIsPayAsYouWishModalOpen(true);
									}
								}}
							>
								{integratorFeeAmount
									? Number(
											formatUnits(
												parseUnits(integratorFeeAmount, 0),
												integratorFeeToken
													? (addressToToken(integratorFeeToken)?.decimals ?? 18)
													: 18,
											),
										).toFixed(4)
									: "zero"}
							</div>
							<div className="stat-desc">
								{integratorFeeToken
									? (addressToToken(integratorFeeToken)?.symbol ??
										formatAddress(integratorFeeToken))
									: ""}
							</div>
						</div>

						<div className="stat">
							<div className="stat-title">0x Fee</div>
							<div className="stat-value">
								{feeAmount
									? formatPrice(
											Number(
												formatUnits(
													parseUnits(feeAmount, 0),
													feeToken
														? (addressToToken(feeToken)?.decimals ?? 18)
														: 18,
												),
											),
										)
									: "zero"}
							</div>
							<div className="stat-desc">
								{feeToken && addressToToken(feeToken)?.symbol
									? addressToToken(feeToken)?.symbol
									: formatAddress(feeToken as `0x${string}`)}
							</div>
						</div>

						<div className="stat">
							<div className="stat-title">Gas Fee</div>
							<div className="stat-value">
								{gasAmount
									? formatPrice(
											Number(
												formatUnits(
													parseUnits(gasAmount, 0),
													gasToken
														? (addressToToken(gasToken)?.decimals ?? 18)
														: 18,
												),
											),
										)
									: "zero"}
							</div>
							<div className="stat-desc">
								{gasToken && addressToToken(gasToken)?.symbol
									? addressToToken(gasToken)?.symbol
									: formatAddress(`0x${gasToken?.replace("0x", "")}`)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-4">
				<button
					type="button"
					className="btn btn-link btn-ghost justify-end"
					onClick={() =>
						openUrl(
							"https://0x.org/docs/0x-swap-api/guides/monetize-your-app-using-swap",
						)
					}
				>
					Learn more
					<i className="ri-external-link-line" />
				</button>
			</div>
		</>
	) : (
		<div className="alert alert-outline">
			<span>Failed to fetch quote. Please try again.</span>
		</div>
	);
};
