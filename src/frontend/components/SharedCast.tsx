import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { useUserDetailsQuery } from "../hooks/queries/useOpenQuery";
import { useWhistleQuery } from "../hooks/queries/useProtectedQuery";
import { useFrameSDK } from "../hooks/use-frame-sdk";
import { ComposeMode, useInMemoryZustand } from "../hooks/use-zustand";
import { MUTE_PHRASE } from "../lib/constants";

export function SharedCast() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [hasSassyHash, setHasSassyHash] = useState(false);
	const [showSassyHash, setShowSassyHash] = useState(false);

	const { jwt, castResponse, setCastResponse, setComposeMode } =
		useInMemoryZustand();
	const { openUrl, viewProfile } = useFrameSDK();

	const { data: userDetails } = useUserDetailsQuery(castResponse?.fid ?? null);
	const author = userDetails?.user;

	const hasSassy = useMemo(
		() => castResponse?.text?.match(/[0-9A-Fa-f]{40}/),
		[castResponse?.text],
	);

	const { data: whistleData } = useWhistleQuery(
		hasSassy ? jwt : null,
		castResponse?.fid ?? 0,
		castResponse?.hash ?? "",
	);

	const handleClearClick = useCallback(() => {
		setHasSassyHash(false);
		setCastResponse(null);
		setComposeMode(ComposeMode.Cast);
	}, [setCastResponse, setComposeMode]);

	const toggleSassyHash = useCallback(() => {
		setShowSassyHash((prev) => !prev);
	}, []);

	const toggleExpand = useCallback(() => {
		setIsExpanded((prev) => !prev);
	}, []);

	useEffect(() => {
		if (whistleData?.success) {
			setHasSassyHash(whistleData.isDecrypted ?? false);
		}
	}, [whistleData]);

	if (!castResponse) return null;

	const text = castResponse.text?.replace(MUTE_PHRASE, "");

	return (
		<div
			className={`card ${showSassyHash ? "bg-black/90 text-white/80" : "bg-base-100"} border border-base-200`}
		>
			<div className="card-body p-4">
				<div className="flex items-start gap-4">
					{author?.pfpUrl && author?.username ? (
						<div className="avatar w-12 h-12">
							<img
								src={author.pfpUrl}
								alt={author.username}
								className="w-full h-full object-cover rounded-full"
							/>
						</div>
					) : null}
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between">
							{author ? (
								<button
									type="button"
									className="btn btn-ghost btn-sm"
									onClick={() => viewProfile(author.fid)}
								>
									<div className="font-bold text-left">
										{author.displayName}
										<br />
										<span
											className={`${showSassyHash ? "text-white/70" : "text-base-content/70"}`}
										>
											@{author.username}
										</span>
									</div>
								</button>
							) : null}
							<div className="flex items-center">
								<button
									type="button"
									className="btn btn-ghost btn-md"
									disabled={!author?.username}
									onClick={() =>
										openUrl(
											`https://farcaster.xyz/${author?.username}/${castResponse.hash.slice(
												0,
												10,
											)}`,
										)
									}
								>
									<i className="ri-external-link-line w-4 h-4" />
								</button>

								<button
									type="button"
									className="btn btn-ghost btn-md"
									onClick={handleClearClick}
									title="Clear cast"
								>
									<i className="ri-close-line w-4 h-4" />
								</button>
							</div>
						</div>
						{showSassyHash ? (
							<div className="mt-2">
								<p className="text-xl whitespace-pre-wrap break-words text-left font-['Noto_Sans']">
									{whistleData?.text}
								</p>
							</div>
						) : (
							<div className="mt-2">
								<p className="text-sm whitespace-pre-wrap break-words text-left">
									{isExpanded
										? text
										: `${text?.slice(0, 180)}${text && text.length > 180 ? "..." : ""}`}
								</p>
								{text && text.length > 180 ? (
									<button
										type="button"
										className="btn btn-ghost btn-sm mt-1 text-primary"
										onClick={toggleExpand}
									>
										{isExpanded ? "Show less" : "Show more"}
									</button>
								) : null}
							</div>
						)}
						{hasSassyHash ? (
							<div className="flex justify-end">
								<button
									type="button"
									className="btn btn-ghost btn-lg"
									onClick={toggleSassyHash}
								>
									{showSassyHash ? "🙈" : "💅"}
								</button>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}
