import { unique } from "radash";
import { useZustand } from "../../hooks/use-zustand";
import {
	DEFAULT_AFFILIATE_FEE_IN_BPS,
	KNOWN_TOKENS,
	type Token,
} from "../../lib/constants";

export const BuyTokenInput = ({
	buyToken,
	sellToken,
	setBuyToken,
	setAffiliateFeeInBps,
	resetFirst,
}: {
	buyToken: Token;
	sellToken: Token;
	setBuyToken: (token: Token) => void;
	setAffiliateFeeInBps: (bps: number) => void;
	resetFirst?: () => void;
}) => {
	const { newToken } = useZustand();

	const tokensList = unique(
		[...KNOWN_TOKENS, ...(newToken ? [newToken] : [])],
		(t) => t.address,
	);
	return (
		<div className="flex items-center gap-2 px-2">
			<img
				src={buyToken.image}
				alt={buyToken.symbol}
				width={100}
				height={100}
				className="w-6 h-6 rounded-full"
			/>
			<select
				value={buyToken.symbol}
				onChange={(e) => {
					const selectedToken =
						tokensList.find(
							(t) => t.symbol === (e.target as HTMLSelectElement).value,
						) || KNOWN_TOKENS[1];
					setBuyToken(selectedToken);

					if (selectedToken.symbol === "BURRITO") {
						setAffiliateFeeInBps(0);
					} else {
						setAffiliateFeeInBps(DEFAULT_AFFILIATE_FEE_IN_BPS);
					}
					resetFirst?.();
				}}
				className="bg-transparent border-none outline-none"
			>
				{tokensList
					.filter((token) => token.symbol !== sellToken.symbol)
					.map((token) => (
						<option key={token.symbol} value={token.symbol}>
							{token.symbol}
						</option>
					))}
			</select>
		</div>
	);
};
