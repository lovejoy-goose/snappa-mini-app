import type { ChangeEvent } from "preact/compat";
import { useCallback, useEffect, useState } from "preact/hooks";
import toast from "react-hot-toast";
import { hexToBytes } from "viem";
import { useImagesQuery } from "../hooks/queries/useCdnQuery";
import { useNamuQuery } from "../hooks/queries/useOpenQuery";
import { useProtectedQuery } from "../hooks/queries/useProtectedQuery";
import { useFrameSDK } from "../hooks/use-frame-sdk";
import {
	ComposeMode,
	useInMemoryZustand,
	useLocalStorageZustand,
} from "../hooks/use-zustand";
import { CDN_URL, LONG_MAX_LENGTH } from "../lib/constants";
import { publishCast } from "../lib/hubs";
import { getByteLength } from "../lib/utils";
import { MediaSelectionModal } from "./MediaSelectionModal";
import { SharedCast } from "./SharedCast";

export const CastCompose = () => {
	const [text, setText] = useState("");
	const [displayText, setDisplayText] = useState("");
	const [errorText, setErrorText] = useState("");
	const [trouble, setTrouble] = useState("");
	const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
	const [selectedImages, setSelectedImages] = useState<string[]>([]);

	const { composeCast } = useFrameSDK();
	const { jwt, secureContextFid, castResponse, composeMode, setComposeMode } =
		useInMemoryZustand();
	const { pk } = useLocalStorageZustand();

	const query = useProtectedQuery(jwt);
	const { pk: pkFromBackend } = query.data ?? {};

	const { data } = useImagesQuery();

	const hasSigner = (pk || pkFromBackend) && secureContextFid;
	const buttonText = hasSigner
		? composeMode === ComposeMode.Reply
			? "Reply w/ signer"
			: composeMode === ComposeMode.Quote
				? "Quote w/ signer"
				: "Cast w/ signer"
		: composeMode === ComposeMode.Reply
			? "Reply"
			: "Compose";

	useEffect(() => {
		if (castResponse) {
			setComposeMode(ComposeMode.Reply);
		}
	}, [castResponse, setComposeMode]);

	const toggleReplyOrQuote = () => {
		setComposeMode(
			composeMode === ComposeMode.Reply ? ComposeMode.Quote : ComposeMode.Reply,
		);
	};

	const debouncedSetText = useCallback((newText: string) => {
		setDisplayText(newText);
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			setText(displayText);
			if (displayText.includes("https://")) {
				setTrouble("Don't go crazy man");
			} else if (displayText.includes("@")) {
				setTrouble(
					"Ain't nobody coding up @ mentions for you, fam. Claude don't kno bout dat stuff",
				);
			} else {
				setTrouble("");
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [displayText]);

	const handleSubmit = async () => {
		if (text.trim()) {
			const embeds = selectedImages.map((imageId) => ({
				url: `${CDN_URL}/${imageId}`,
			}));
			if (hasSigner) {
				try {
					if (composeMode === ComposeMode.Quote && castResponse) {
						await publishCast({
							fid: secureContextFid,
							pk: pk ?? pkFromBackend,
							text,
							embeds: [
								{
									castId: {
										fid: castResponse.fid,
										hash: hexToBytes(castResponse.hash),
									},
								},
								...embeds.slice(0, 1),
							],
						});
					} else {
						await publishCast({
							fid: secureContextFid,
							pk: pk ?? pkFromBackend,
							text,
							parentCast: castResponse
								? {
										fid: castResponse.fid,
										hash: castResponse.hash,
									}
								: undefined,
							embeds,
						});
					}
					toast.success("Successfully submitted to Snapchain");
					setErrorText("");
				} catch (error) {
					console.error(error);
					setErrorText(
						error instanceof Error
							? error.message
							: JSON.stringify(error, null, 2),
					);
					toast.error("Failed to publish cast");
				}
			} else {
				await composeCast(
					text,
					castResponse
						? {
								type: "cast",
								hash: castResponse.hash,
							}
						: undefined,
					embeds.length < 1
						? undefined
						: embeds.length === 1
							? [embeds[0].url]
							: [embeds[0].url, embeds[1].url],
				);
			}
			setText("");
			setDisplayText("");
		}
	};

	const handleMediaSelection = (imageIds: string[]) => {
		setSelectedImages(imageIds);
	};

	const removeImage = (imageId: string) => {
		setSelectedImages((prev) => prev.filter((id) => id !== imageId));
		// Remove the image URL from the text
		const currentText = displayText
			.split("\n")
			.filter((line) => line !== imageId)
			.join("\n");
		debouncedSetText(currentText);
	};

	return (
		<div
			className="flex flex-col gap-4 my-4"
			onClick={(e) => {
				// If clicking on the container (not a button), blur any focused elements
				if (e.target === e.currentTarget) {
					const activeElement = document.activeElement;
					if (activeElement instanceof HTMLElement) {
						activeElement.blur();
					}
				}
			}}
			onKeyDown={() => {}}
		>
			<div className="relative">
				<textarea
					className="textarea textarea-bordered w-full h-32 focus:outline-none"
					placeholder="What's happening?"
					value={displayText}
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
						const target = e.target as HTMLTextAreaElement;
						const newText = target.value;
						if (getByteLength(newText) <= LONG_MAX_LENGTH) {
							debouncedSetText(newText);
						} else {
							// Truncate the text to fit within byte limit
							const encoder = new TextEncoder();
							const decoder = new TextDecoder();
							const truncatedBytes = encoder
								.encode(newText)
								.slice(0, LONG_MAX_LENGTH);
							debouncedSetText(decoder.decode(truncatedBytes));
							toast.error("Text too long, truncated");
						}
					}}
					onPaste={(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
						const target = e.target as HTMLTextAreaElement;
						// Allow the paste to complete first
						setTimeout(() => {
							target.blur();
						}, 0);
					}}
				/>
				<div className="absolute right-0 -bottom-6 text-sm text-base-content/70">
					{getByteLength(displayText)}/{LONG_MAX_LENGTH}
				</div>
			</div>

			<div className="flex flex-col items-start">
				<div className="text-sm text-error text-left">{trouble}</div>
			</div>
			<div className="flex justify-between items-center">
				<div className="join max-w-1/2">
					<button
						type="button"
						onClick={handleSubmit}
						disabled={!text.trim()}
						className="btn btn-primary btn-wide"
					>
						{buttonText}
					</button>
					{castResponse && hasSigner ? (
						<button
							type="button"
							onClick={toggleReplyOrQuote}
							disabled={!text.trim()}
							className="btn btn-soft"
						>
							{composeMode === ComposeMode.Reply ? (
								<i className="ri-refresh-line" />
							) : (
								<i className="ri-chat-4-line" />
							)}
						</button>
					) : null}
				</div>
				<button
					type="button"
					onClick={() => setIsMediaModalOpen(true)}
					disabled={!text.trim()}
					className="btn btn-ghost btn-lg"
				>
					<i className="ri-image-add-line text-xl" />
				</button>
				<div />
			</div>

			<div className="text-sm text-error text-left">{errorText}</div>

			{selectedImages.length > 0 && (
				<div className="flex gap-8">
					{selectedImages.map((imageId) => (
						<div key={imageId} className="relative group">
							<img
								src={`${CDN_URL}/${imageId}`}
								alt="Selected media"
								className="w-36 h-36 object-cover rounded-lg"
								loading="lazy"
							/>
							<button
								type="button"
								onClick={() => removeImage(imageId)}
								className="absolute -top-0 -right-2 rounded-full p-1 opacity-70"
								aria-label="Remove image"
							>
								<i className="ri-close-circle-line text-error/70 text-2xl" />
							</button>
						</div>
					))}
				</div>
			)}

			<SharedCast />

			<MediaSelectionModal
				isOpen={isMediaModalOpen}
				onClose={() => setIsMediaModalOpen(false)}
				onConfirm={handleMediaSelection}
				recentImages={(data?.images ?? [])
					.slice(0, 6)
					.sort((a, b) => b.uploadedAt - a.uploadedAt)}
			/>
		</div>
	);
};
