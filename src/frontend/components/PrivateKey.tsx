import { useCallback, useState } from "preact/hooks";
import toast from "react-hot-toast";
import { useLocalStorageZustand } from "../hooks/use-zustand";
import { PkModal } from "./PkModal";

const privateKeyRegex = /^0x[0-9a-fA-F]{64}$/;

export const PrivateKey = () => {
	const { pk, setPk } = useLocalStorageZustand();
	const [inputValue, setInputValue] = useState("");
	const [showModal, setShowModal] = useState(false);

	const handleInputChange = useCallback((e: Event) => {
		const target = e.target as HTMLInputElement;
		setInputValue(target.value);
	}, []);

	const handleSubmit = useCallback(() => {
		setPk(inputValue);
	}, [inputValue, setPk]);

	const handleKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Enter") {
				handleSubmit();
			}
		},
		[handleSubmit],
	);

	const handleClear = useCallback(() => {
		setPk(null);
		setInputValue("");
	}, [setPk]);

	const handleCopy = useCallback(() => {
		if (pk) {
			navigator.clipboard.writeText(pk);
			toast.success("Copied to clipboard");
		}
	}, [pk]);

	const toggleModal = useCallback(() => {
		setShowModal(!showModal);
	}, [showModal]);

	return (
		<>
			{pk ? (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						Private Key stored in browser only!
						<div className="join">
							<button
								type="button"
								onClick={handleCopy}
								className="btn btn-ghost btn-sm join-item"
								title="Copy to clipboard"
							>
								<i className="ri-file-copy-line" />
							</button>
							<button
								type="button"
								onClick={handleClear}
								className="btn btn-ghost btn-sm join-item"
								title="Clear private key"
							>
								<i className="ri-delete-bin-line" />
							</button>
						</div>
					</div>
				</div>
			) : (
				<div className="space-y-2">
					<div className="join w-full">
						<form>
							<input
								type="password"
								placeholder="[OPTIONAL] signer Private Key"
								value={inputValue}
								autoComplete="off"
								pattern={privateKeyRegex.source}
								onChange={handleInputChange}
								onKeyPress={handleKeyPress}
								className="input validator input-bordered join-item w-full min-w-[260px] focus:outline-none"
							/>
							<p className="validator validator-hint">
								must be a 40 character hex string
							</p>
						</form>
						<button
							type="button"
							onClick={handleSubmit}
							className="btn btn-primary join-item"
							disabled={!inputValue || !privateKeyRegex.test(inputValue)}
						>
							<i className="ri-arrow-right-line" />
						</button>
						<button
							type="button"
							onClick={toggleModal}
							className="btn btn-ghost join-item"
							title="Learn more about private keys"
						>
							<i className="ri-question-line" />
						</button>
					</div>
				</div>
			)}

			{/* Modal */}
			<PkModal showModal={showModal} toggleModal={toggleModal} />
		</>
	);
};
