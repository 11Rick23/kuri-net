import { useEffect, useState } from "react";

type UseGlobalDragOptions = {
	onDropFiles?: (files: File[]) => void;
};

export function useGlobalDrag({ onDropFiles }: UseGlobalDragOptions = {}) {
	const [isDragging, setIsDragging] = useState(false);
	const [isDraggingPDF, setIsDraggingPDF] = useState(false);

	useEffect(() => {
		const isDraggingFile = (e: DragEvent) => {
			return (
				!!e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files")
			);
		};

		const isDraggingPDF = (e: DragEvent) => {
			if (
				!e.dataTransfer ||
				!Array.from(e.dataTransfer.types).includes("Files")
			) {
				return false;
			}

			const files = Array.from(e.dataTransfer.items);
			if (files.length === 0) return false;

			return files.some((file) => file.type === "application/pdf");
		};

		const preventDefault = (e: DragEvent) => {
			if (!isDraggingFile(e)) return;
			e.preventDefault();
			e.stopPropagation();
		};

		const handleDragOver = (e: DragEvent) => {
			if (!isDraggingFile(e)) return;
			preventDefault(e);
			setIsDragging(true);
			setIsDraggingPDF(isDraggingPDF(e));
		};

		const handleDragLeave = (e: DragEvent) => {
			if (!isDraggingFile(e)) return;
			preventDefault(e);
			// Only set isDragging to false if the drag has left the window
			if ((e as DragEvent).relatedTarget === null) {
				setIsDragging(false);
			}
		};

		const handleDrop = (e: DragEvent) => {
			if (!isDraggingFile(e)) return;
			preventDefault(e);
			setIsDragging(false);

			if (!e.dataTransfer) return;
			const files = Array.from(e.dataTransfer.files);
			onDropFiles?.(files);
		};

		window.addEventListener("dragover", handleDragOver);
		window.addEventListener("dragenter", handleDragOver);
		window.addEventListener("dragleave", handleDragLeave);
		window.addEventListener("drop", handleDrop);

		// ページ内のデフォルト動作無効化（ファイルが開いてしまうのを防ぐ）
		window.addEventListener("dragover", preventDefault);
		window.addEventListener("drop", preventDefault);

		return () => {
			window.removeEventListener("dragover", handleDragOver);
			window.removeEventListener("dragenter", handleDragOver);
			window.removeEventListener("dragleave", handleDragLeave);
			window.removeEventListener("drop", handleDrop);
			window.removeEventListener("dragover", preventDefault);
			window.removeEventListener("drop", preventDefault);
		};
	}, [onDropFiles]);

	return { isDragging, isDraggingPDF };
}
