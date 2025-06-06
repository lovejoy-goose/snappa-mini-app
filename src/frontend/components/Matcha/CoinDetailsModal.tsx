import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "preact/hooks";
import type { GeckoTerminalCoinDetails } from "../../../shared/types";

interface CoinDetailsModalProps {
	coinDetails: GeckoTerminalCoinDetails | null;
	isOpen: boolean;
	onClose: () => void;
}

export const CoinDetailsModal = ({
	coinDetails,
	isOpen,
	onClose,
}: CoinDetailsModalProps) => {
	const [showMore, setShowMore] = useState(false);

	const attributes = coinDetails?.data.attributes;

	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-50">
			<div className="fixed inset-0 bg-black/50" aria-hidden="true" />
			<div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
				<DialogPanel className="mx-auto w-full max-w-md rounded-lg bg-base-100 p-8 shadow-xl my-auto">
					{/* Action Buttons */}
					<div className="mt-8 flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="btn btn-ghost btn-lg"
						>
							Close
						</button>
					</div>

					{/* PFP */}
					<div className="flex items-center gap-4 mb-6">
						{attributes?.image_url && (
							<img
								src={attributes.image_url}
								alt={`${attributes.name} logo`}
								className="w-12 h-12 rounded-full object-cover"
							/>
						)}
						<DialogTitle className="text-xl font-medium">
							{attributes?.name}
						</DialogTitle>
					</div>

					<div className="flex flex-col gap-6">
						{/* Basic Info */}
						<div className="flex flex-col gap-2">
							<p className="text-sm text-gray-500">Symbol</p>
							<p className="text-lg font-medium">${attributes?.symbol}</p>
						</div>

						{/* Categories */}
						{attributes?.categories && attributes.categories.length > 0 && (
							<div className="flex flex-col gap-2">
								<p className="text-sm text-gray-500">Categories</p>
								<div className="flex flex-wrap gap-2">
									{attributes.categories.map((category) => (
										<span key={category} className="badge badge-soft">
											{category}
										</span>
									))}
								</div>
							</div>
						)}
						{/* GT Score */}
						{attributes?.gt_score && (
							<div className="flex flex-col gap-2">
								<p className="text-sm text-gray-500">GeckoTerminal Score</p>
								<div className="flex items-center gap-2">
									<div className="w-full bg-gray-200 rounded-full h-2.5">
										<div
											className="bg-primary h-2.5 rounded-full"
											style={{
												width: `${attributes.gt_score}%`,
											}}
										/>
									</div>
									<span className="text-sm font-medium">
										{attributes.gt_score.toFixed(2)}%
									</span>
								</div>
								{attributes.gt_score_details && (
									<div className="grid grid-cols-2 gap-2 text-xs mt-2">
										<div>Pool: {attributes.gt_score_details.pool}%</div>
										<div>
											Transaction: {attributes.gt_score_details.transaction}%
										</div>
										<div>Creation: {attributes.gt_score_details.creation}%</div>
										<div>Info: {attributes.gt_score_details.info}%</div>
										<div>Holders: {attributes.gt_score_details.holders}%</div>
									</div>
								)}
							</div>
						)}

						{/* Description */}
						{attributes?.description && (
							<div className="flex flex-col gap-2">
								<p className="text-sm text-gray-500">Description</p>
								<p className="text-sm">
									{showMore
										? attributes.description
										: attributes.description.slice(0, 100)}
								</p>
								{attributes.description.length > 100 && (
									<button
										type="button"
										className="text-secondary/50"
										onClick={() => setShowMore(!showMore)}
									>
										{showMore ? "Read Less" : "Read More"}
									</button>
								)}
							</div>
						)}

						{/* Social Links */}
						{(attributes?.twitter_handle ||
							attributes?.telegram_handle ||
							attributes?.discord_url) && (
							<div className="flex flex-col gap-2">
								<p className="text-sm text-gray-500">Social Links</p>
								<div className="flex gap-4">
									{attributes.twitter_handle && (
										<a
											href={`https://twitter.com/${attributes.twitter_handle}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											Twitter
										</a>
									)}
									{attributes.telegram_handle && (
										<a
											href={`https://t.me/${attributes.telegram_handle}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											Telegram
										</a>
									)}
									{attributes.discord_url && (
										<a
											href={attributes.discord_url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											Discord
										</a>
									)}
								</div>
							</div>
						)}

						{/* Holder Information */}
						{attributes?.holders && (
							<div className="flex flex-col gap-2">
								<p className="text-sm text-gray-500">Holder Information</p>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div>
										Total Holders: {attributes.holders.count?.toLocaleString()}
									</div>
									<div>
										Last Updated:{" "}
										{new Date(
											attributes.holders.last_updated,
										).toLocaleDateString()}
									</div>
									{attributes.holders.distribution_percentage && (
										<>
											<div>
												Top 10:{" "}
												{attributes.holders.distribution_percentage.top_10}%
											</div>
											<div>
												11-30:{" "}
												{attributes.holders.distribution_percentage["11_30"]}%
											</div>
											<div>
												31-50:{" "}
												{attributes.holders.distribution_percentage["31_50"]}%
											</div>
											<div>
												Rest: {attributes.holders.distribution_percentage.rest}%
											</div>
										</>
									)}
								</div>
							</div>
						)}
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
};
