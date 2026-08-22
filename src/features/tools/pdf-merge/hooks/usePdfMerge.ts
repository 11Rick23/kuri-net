import type { ChangeEvent } from "react";
import { useCallback, useRef, useState } from "react";
import {
	createFileEntries,
	mergePdfFiles,
	removeFileEntriesByID,
	selectPdfFiles,
} from "@/features/tools/pdf-merge/domain/pdfFiles";
import type { FileEntry } from "@/features/tools/pdf-merge/types";
import { useToast } from "@/shared/components/toast/ToastProvider";

export function usePdfMerge() {
	const [files, setFiles] = useState<FileEntry[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const isLoadingRef = useRef(false);
	const { toast } = useToast();

	const addFiles = useCallback((newFiles: File[]) => {
		if (isLoadingRef.current) {
			return;
		}

		const pdfFiles = selectPdfFiles(newFiles);

		if (pdfFiles.length === 0) {
			return;
		}

		setFiles((prev) => [
			...prev,
			...createFileEntries(pdfFiles, () => crypto.randomUUID()),
		]);
	}, []);

	const handleFileInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const selectedFiles = event.currentTarget.files
				? Array.from(event.currentTarget.files)
				: [];

			event.currentTarget.value = "";
			addFiles(selectedFiles);
		},
		[addFiles],
	);

	const removeFile = useCallback((id: string) => {
		if (isLoadingRef.current) {
			return;
		}

		setFiles((prev) => prev.filter((entry) => entry.id !== id));
	}, []);

	const clearFiles = useCallback(() => {
		if (isLoadingRef.current) {
			return;
		}

		setFiles([]);
	}, []);

	const reorderFiles = useCallback((newFiles: FileEntry[]) => {
		if (isLoadingRef.current) {
			return;
		}

		setFiles(newFiles);
	}, []);

	const mergePdfs = useCallback(async () => {
		if (isLoadingRef.current) {
			return;
		}

		if (files.length < 2) {
			toast("統合するには PDF ファイルを2つ以上追加してください。", {
				type: "warning",
				id: "pdf-merge-min-files",
			});
			return;
		}

		const mergingFiles = files;
		const mergingFileIDs = new Set(mergingFiles.map(({ id }) => id));
		isLoadingRef.current = true;
		setIsLoading(true);

		try {
			const mergedPdfBytes = await mergePdfFiles(
				mergingFiles.map(({ file }) => file),
			);
			const blob = new Blob([Uint8Array.from(mergedPdfBytes)], {
				type: "application/pdf",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");

			try {
				link.href = url;
				link.download = `merged_${Date.now()}.pdf`;
				document.body.appendChild(link);
				link.click();
			} finally {
				link.remove();
				URL.revokeObjectURL(url);
			}

			setFiles((currentFiles) =>
				removeFileEntriesByID(currentFiles, mergingFileIDs),
			);
		} catch (error) {
			console.error("PDF統合エラー:", error);
			toast(
				"PDF の統合に失敗しました。ファイルを確認して再度お試しください。",
				{
					type: "error",
					id: "pdf-merge-error",
				},
			);
		} finally {
			isLoadingRef.current = false;
			setIsLoading(false);
		}
	}, [files, toast]);

	return {
		files,
		isLoading,
		addFiles,
		handleFileInputChange,
		removeFile,
		clearFiles,
		reorderFiles,
		mergePdfs,
	};
}
