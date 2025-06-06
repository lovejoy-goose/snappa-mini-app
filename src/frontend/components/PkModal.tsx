import { useFrameSDK } from "../hooks/use-frame-sdk";

export const PkModal = ({
	showModal,
	toggleModal,
}: { showModal: boolean; toggleModal: () => void }) => {
	const { openUrl } = useFrameSDK();
	return (
		<dialog className="modal" open={showModal}>
			<div className="modal-box">
				<h3 className="font-bold text-lg mb-4">Signer Private Keys</h3>
				<div className="space-y-4">
					<p>
						A signer private key is a long string that allows you to sign
						activity messages on Sanpchain: casts, re-casts, replies, likes,
						follows.
					</p>
					<p>
						Get your own at
						<button
							type="button"
							className="btn btn-link"
							onClick={() => openUrl("https://castkeys.xyz")}
						>
							castkeys.xyz
						</button>
						.<br /> Or, clone that repo to have your name show up, like
						<button
							type="button"
							className="btn btn-link"
							onClick={() => openUrl("https://castkeys.artlu.xyz")}
						>
							castkeys.artlu.xyz
						</button>
						.
						<br />
						<span className="text-xs italic">
							(small fee required to pay to Warpcast)
						</span>
					</p>
					<div className="alert alert-warning">
						<i className="ri-error-warning-line text-xl" />
						<span>
							If someone has your private key, they can sign messages on your
							behalf.
						</span>
					</div>
					<div className="alert alert-info">
						<i className="ri-information-line text-xl" />
						<span>
							Your private key is stored locally in your browser and never sent
							to our servers.
						</span>
					</div>
				</div>
				<div className="modal-action">
					<button type="button" className="btn" onClick={toggleModal}>
						Close
					</button>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={toggleModal}>
					close
				</button>
			</form>
		</dialog>
	);
};
