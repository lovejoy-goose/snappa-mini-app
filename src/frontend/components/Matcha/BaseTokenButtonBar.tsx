import { ALLOWED_BASE_TOKENS, type Token } from "../../lib/constants";

interface BaseTokenButtonBarProps {
	baseToken: Token;
	setBaseToken: (token: Token) => void;
}
export const BaseTokenButtonBar = ({
	baseToken,
	setBaseToken,
}: BaseTokenButtonBarProps) => {
	return (
		<div className="flex gap-2 join justify-center items-center">
			{ALLOWED_BASE_TOKENS.map((token) => (
				<button
					key={token.symbol}
					type="button"
					className={`btn btn-sm btn-soft join-item ${
						baseToken.symbol === token.symbol ? "" : "btn-primary"
					}`}
					onClick={() => setBaseToken(token)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							setBaseToken(token);
						}
					}}
				>
					{token.symbol}
				</button>
			))}
		</div>
	);
};
