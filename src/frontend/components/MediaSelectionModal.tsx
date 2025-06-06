import { useState } from "preact/hooks";
import { CDN_URL, type Image } from "../lib/constants";

interface MediaSelectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (selectedImages: string[]) => void;
	recentImages: Image[];
}

export const MediaSelectionModal = ({
	isOpen,
	onClose,
	onConfirm,
	recentImages,
}: MediaSelectionModalProps) => {
	const [selectedImages, setSelectedImages] = useState<string[]>([]);

	const handleImageClick = (id: string) => {
		setSelectedImages((prev) => {
			if (prev.includes(id)) {
				return prev.filter((imageId) => imageId !== id);
			}
			if (prev.length < 2) {
				return [...prev, id];
			}
			return prev;
		});
	};

	const handleConfirm = () => {
		onConfirm(selectedImages);
		setSelectedImages([]);
		onClose();
	};

	return (
		<dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
			<div className="modal-box">
				<h3 className="font-bold text-lg mb-4">Select Images</h3>
				<div className="modal-action">
					<button type="button" className="btn btn-ghost" onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={handleConfirm}
						disabled={selectedImages.length === 0}
					>
						Confirm ({selectedImages.length} selected)
					</button>
				</div>
				<div className="grid grid-cols-2 gap-4 my-4">
					{recentImages.map((image) => (
						<button
							type="button"
							key={image.id}
							className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
								selectedImages.includes(image.id)
									? "border-primary"
									: "border-transparent"
							}`}
							onClick={() => handleImageClick(image.id)}
						>
							<img
								src={`${CDN_URL}/${image.id}`}
								alt="Recent media thumbnail"
								className="w-full h-32 object-cover"
							/>
							{selectedImages.includes(image.id) && (
								<div className="absolute top-0 right-2 rounded-full p-1">
									<i className="ri-checkbox-circle-line text-primary text-2xl" />
								</div>
							)}
						</button>
					))}
				</div>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={onClose}>
					close
				</button>
			</form>
		</dialog>
	);
};
