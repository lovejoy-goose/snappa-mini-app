import { useFrameSDK } from "../hooks/use-frame-sdk";
import { SharedCast } from "./SharedCast";

interface SoonTMProps {
	showPastedCast: boolean;
	linkOut?: string;
}

export const SoonTM = ({ showPastedCast, linkOut }: SoonTMProps) => {
	const { openUrl } = useFrameSDK();

	return (
		<div className="flex flex-col gap-4 my-4">
			{showPastedCast && <SharedCast />}

			{linkOut && (
				<button
					type="button"
					className="btn btn-soft"
					onClick={() => openUrl(linkOut)}
				>
					picosub
					<i className="ri-arrow-right-long-line" />
				</button>
			)}
		</div>
	);
};
