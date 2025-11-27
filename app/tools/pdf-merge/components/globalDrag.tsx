import { useEffect, useState } from "react";

type UseGlobalDragOptions = {
	onDropFiles?: (files: File[]) => void;
};

export function useGlobalDrag({ onDropFiles }: UseGlobalDragOptions = {}) {
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		const preventDefault = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
		};

		const handleDragOver = (e: DragEvent) => {
			preventDefault(e);
			setIsDragging(true);
		};

		const handleDragLeave = (e: DragEvent) => {
			preventDefault(e);
			setIsDragging(false);
		};

		const handleDrop = (e: DragEvent) => {
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

	return { isDragging };
}