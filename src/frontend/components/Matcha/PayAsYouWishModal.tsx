import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState } from "preact/hooks";

interface PayAsYouWishModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (amount: number) => void;
	currentAmount: number;
	minAmount: number;
}

export const PayAsYouWishModal = ({
	isOpen,
	onClose,
	onConfirm,
	currentAmount,
	minAmount,
}: PayAsYouWishModalProps) => {
	const [amount, setAmount] = useState(currentAmount);

	useEffect(() => {
		setAmount(Math.max(currentAmount, minAmount));
	}, [currentAmount, minAmount]);

	const handleConfirm = () => {
		onConfirm(amount);
		onClose();
	};

	const handleCancel = () => {
		setAmount(currentAmount);
		onClose();
	};

	return (
		<Dialog open={isOpen} onClose={handleCancel} className="relative z-50">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			<div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
				<DialogPanel className="mx-auto w-full max-w-md rounded-lg bg-base-200 p-8 shadow-xl my-auto">
					<DialogTitle className="text-xl font-medium mb-6">
						Pay As You Wish
					</DialogTitle>

					<div className="space-y-8">
						{/* Slider */}
						<div>
							<div className="flex justify-between text-base mb-3">
								<span>{minAmount} bps</span>
								<span>150+ bps</span>
							</div>
							<input
								type="range"
								min={minAmount}
								max="150"
								step="5"
								value={amount}
								onChange={(e) => setAmount(Number(e.currentTarget.value))}
								className="range range-primary range-lg bg-base-300"
							/>
						</div>

						{/* Input Box */}
						<div>
							<label htmlFor="amount-input" className="label">
								<span className="label-text text-base">Amount</span>
							</label>
							<input
								id="amount-input"
								type="number"
								inputMode="decimal"
								pattern="[0-9]*"
								value={amount}
								onChange={(e) => setAmount(Number(e.currentTarget.value))}
								className="input input-bordered input-lg w-full bg-base-100"
								min="0"
								max={minAmount}
								step="0.01"
							/>
						</div>

						{/* Quick Select Buttons */}
						<div className="flex gap-3 items-center">
							<button
								type="button"
								onClick={() => setAmount(60)}
								className="btn btn-outline btn-sm flex-1"
							>
								60bps
							</button>
							<button
								type="button"
								onClick={() => setAmount(80)}
								className="btn btn-outline btn-md flex-1 "
							>
								80bps
							</button>
							<button
								type="button"
								onClick={() => setAmount(100)}
								className="btn btn-outline btn-lg flex-1"
							>
								100bps
							</button>
						</div>

						{/* Action Buttons */}
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={handleCancel}
								className="btn btn-ghost btn-lg"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleConfirm}
								className="btn btn-primary btn-lg"
							>
								Confirm
							</button>
						</div>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
};
