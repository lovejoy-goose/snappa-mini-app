import type { PriceResponse, QuoteResponse } from "../../lib/zeroex";

interface RoutingCardProps {
	pq: PriceResponse | QuoteResponse | undefined;
}
export const RoutingCard = ({ pq }: RoutingCardProps) => {
	return pq?.route?.tokens ? (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body">
				<div className="stats">
					<div className="stat">
						<div className="stat-title">Routes</div>
						<div className="stat-value">{pq.route.fills.length}</div>
						<div className="stat-desc">
							<ul className="list-disc list-inside text-left">
								{pq.route.fills.map((r, idx) => (
									<li key={`${r.source}-${idx}`}>{r.source}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
				<div className="stats">
					<div className="stat">
						<div className="stat-title">Steps</div>
						<div className="stat-value">{pq.route.tokens.length}</div>
						<div className="stat-desc">
							{pq.route.tokens.map((t) => t.symbol).join(" → ")}
						</div>
					</div>
				</div>
			</div>
		</div>
	) : null;
};
