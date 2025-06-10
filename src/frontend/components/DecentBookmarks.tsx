import { useState } from "preact/hooks";
import { toast } from "react-hot-toast";
import {
	useCastDetailsByUsernameShortHashQuery,
	useUserDetailsQuery,
} from "../hooks/queries/useOpenQuery";
import {
	useAddDecentBookmarkQuery,
	useDecentBookmarksQuery,
	useDeleteDecentBookmarkQuery,
} from "../hooks/queries/useProtectedQuery";
import { useFrameSDK } from "../hooks/use-frame-sdk";
import { useInMemoryZustand } from "../hooks/use-zustand";
import { BookmarkedCast } from "./BookmarkedCast";
import { SharedCast } from "./SharedCast";

const loadingSkeleton = (
	<>
		{[1, 2, 3].map((i) => (
			<li key={i} className="list-row">
				<div className="flex items-center gap-2">
					<div className="skeleton h-4 w-24" />
					<div className="skeleton h-4 w-12" />
				</div>
				<div className="flex flex-col gap-1">
					<div className="skeleton h-4 w-32" />
					<div className="skeleton h-3 w-20" />
				</div>
				<div className="flex gap-2">
					<div className="skeleton h-8 w-8 rounded" />
					<div className="skeleton h-8 w-8 rounded" />
				</div>
			</li>
		))}
	</>
);

export const DecentBookmarks = () => {
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedHash, setSelectedHash] = useState<string | null>(null);

	const { jwt, castResponse } = useInMemoryZustand();
	const { viewProfile } = useFrameSDK();

	const {
		data: decentBookmarks,
		isLoading,
		refetch,
	} = useDecentBookmarksQuery(jwt);
	const { mutate: addDecentBookmark } = useAddDecentBookmarkQuery(jwt);
	const { mutate: deleteDecentBookmark } = useDeleteDecentBookmarkQuery(jwt);

	const handleAddDecentBookmark = (fid: number, hash: string) => {
		addDecentBookmark(
			{ fid, hash },
			{
				onSuccess: () => {
					toast.success("Bookmark added");
					refetch();
				},
			},
		);
	};

	const handleDeleteDecentBookmark = (hash: string) => {
		setSelectedHash(hash);
		setModalOpen(true);
	};

	const confirmDelete = () => {
		if (selectedHash) {
			deleteDecentBookmark(selectedHash, {
				onSuccess: () => {
					toast.success("Bookmark deleted");
					refetch();
				},
				onError: () => {
					toast.error("Failed to delete bookmark");
				},
			});
		}
		setModalOpen(false);
		setSelectedHash(null);
	};

	return (
		<div className="flex flex-col gap-4 my-4 pb-16">
			{/* Modal */}
			<dialog id="delete-modal" className="modal" open={modalOpen}>
				<div className="modal-box">
					<h3 className="font-bold text-lg">Delete Bookmark</h3>
					<p className="py-4">Are you sure you want to delete this bookmark?</p>
					<div className="modal-action">
						<button
							type="button"
							className="btn btn-ghost"
							onClick={() => setModalOpen(false)}
						>
							Cancel
						</button>
						<button
							type="button"
							className="btn btn-error"
							onClick={confirmDelete}
						>
							Delete
						</button>
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button type="button" onClick={() => setModalOpen(false)}>
						close
					</button>
				</form>
			</dialog>

			{castResponse?.fid && castResponse?.hash ? (
				<div className="relative left-32 top-6">
					<button
						type="button"
						className="btn btn-primary btn-lg"
						disabled={!castResponse?.fid || !castResponse?.hash}
						onClick={() =>
							handleAddDecentBookmark(castResponse?.fid, castResponse?.hash)
						}
					>
						add
					</button>
				</div>
			) : null}

			<SharedCast />

			<ul className="list list-none bg-base-100 border-t border-base-200 pt-4">
				<li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
					<div className="flex items-center justify-between gap-2">
						<button
							type="button"
							className="btn btn-square btn-ghost"
							onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
						>
							<i
								className={`ri-sort-${sortOrder === "asc" ? "desc" : "asc"}`}
							/>
						</button>
						<div>Decent Bookmarks 🔖</div>
					</div>
				</li>

				{isLoading
					? loadingSkeleton
					: (decentBookmarks?.bookmarks ?? [])
							.sort(
								(a, b) =>
									(a.timestamp - b.timestamp) * (sortOrder === "asc" ? 1 : -1),
							)
							.map((bookmark, idx) => {
								const { timestamp, hash, username, fid } = bookmark;
								const timestampDate = new Date(timestamp);
								const timstampDateOnly = timestampDate.toLocaleDateString();

								const { data: userDetails, isLoading: userDetailsLoading } =
									useUserDetailsQuery(fid);
								const { data: castDetails, isLoading: castDetailsLoading } =
									useCastDetailsByUsernameShortHashQuery(
										username,
										`0x${hash.replace("0x", "").slice(0, 8)}` as `0x${string}`,
									);
								return (
									<>
										<li key={`${hash}-cast`}>
											{userDetails?.user && castDetails?.cast ? (
												<BookmarkedCast
													author={userDetails.user}
													castResponse={castDetails.cast}
												/>
											) : (
												<span className="opacity-60">
													{`${userDetailsLoading || castDetailsLoading ? "loading" : "unable to find"} cast ${hash.slice(0, 6)}...${hash.slice(-4)} by `}
													<button
														type="button"
														onClick={() => viewProfile(fid)}
													>
														@{username}
													</button>
												</span>
											)}
										</li>

										<li className="list-row" key={`${hash}-bookmark`}>
											<div className="text-xs opacity-60">
												{idx + 1}: bookmarked {timstampDateOnly}
											</div>
											<div>
												<button
													type="button"
													className="btn btn-square btn-lg -translate-y-4"
													onClick={() => handleDeleteDecentBookmark(hash)}
												>
													<i className="ri-pushpin-line" />
												</button>
											</div>
										</li>
									</>
								);
							})}
			</ul>
		</div>
	);
};
