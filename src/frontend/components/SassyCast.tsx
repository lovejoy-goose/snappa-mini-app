import { keccak256 } from "js-sha3";
import type { ChangeEvent } from "preact/compat";
import { useCallback, useEffect, useState } from "preact/hooks";
import toast from "react-hot-toast";
import { useWriteWhistleQuery } from "../hooks/queries/useProtectedQuery";
import { useFrameSDK } from "../hooks/use-frame-sdk";
import {
	ComposeMode,
	useInMemoryZustand,
	useLocalStorageZustand,
} from "../hooks/use-zustand";
import { MAX_LENGTH, MUTE_PHRASE } from "../lib/constants";
import { getByteLength } from "../lib/utils";
import { SharedCast } from "./SharedCast";

export const SassyCast = () => {
	const [text, setText] = useState("");
	const [displayText, setDisplayText] = useState("");
	const [trouble, setTrouble] = useState("");

	const { composeCast } = useFrameSDK();
	const { castResponse, jwt, composeMode, setComposeMode } =
		useInMemoryZustand();
	const { mutePhrase, toggleMutePhrase } = useLocalStorageZustand();

	const { mutateAsync: writeWhistle } = useWriteWhistleQuery(jwt, text);

	const buttonText = composeMode === ComposeMode.Reply ? "Reply" : "Compose";

	useEffect(() => {
		if (castResponse) {
			setComposeMode(ComposeMode.Reply);
		}
	}, [castResponse, setComposeMode]);

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

	const handleSassyComposer = async () => {
		if (text.trim()) {
			try {
				const res = await writeWhistle();
				if (!res.success) {
					toast.error(`SassyHash write error: ${res.message}`);
				}
			} catch (error) {
				toast.error("Failed to write SassyHash 💅");
			}
			const hash = keccak256(text);
			await composeCast(
				`${hash}${mutePhrase ? `\n\n${MUTE_PHRASE}` : ""}`,
				castResponse
					? {
							type: "cast",
							hash: castResponse.hash,
						}
					: undefined,
			);
			setText("");
			setDisplayText("");
		}
	};
	return (
		<div
			className="flex flex-col gap-4 my-4 pb-16"
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
						if (getByteLength(newText) <= MAX_LENGTH) {
							debouncedSetText(newText);
						} else {
							// Truncate the text to fit within byte limit
							const encoder = new TextEncoder();
							const decoder = new TextDecoder();
							const truncatedBytes = encoder
								.encode(newText)
								.slice(0, MAX_LENGTH);
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
					{getByteLength(displayText)}/{MAX_LENGTH}
				</div>
			</div>
			<div className="flex flex-col items-start">
				<div className="text-sm text-error text-left">{trouble}</div>
			</div>
			<div className="flex justify-between items-center">
				<div className="join max-w-1/2">
					<button
						type="button"
						onClick={handleSassyComposer}
						disabled={!text.trim()}
						className="btn btn-soft btn-wide"
					>
						<span className="text-lg">💅</span>
						{buttonText}
					</button>
				</div>

				<label className="label flex flex-col items-center gap-0">
					<span className="label-text text-xs italic">mute</span>
					<input
						type="checkbox"
						defaultChecked={mutePhrase}
						onChange={toggleMutePhrase}
						className="toggle"
					/>
				</label>
			</div>

			{mutePhrase ? (
				<span className="text-sm text-left italic text-wrap mx-8">
					{MUTE_PHRASE}
				</span>
			) : null}
			<SharedCast />
		</div>
	);
};
