import { nanoid } from "nanoid";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import type { FileEntry } from "@/features/tools/pdf-merge/types";
import { useToast } from "@/shared/components/toast/ToastProvider";

export function usePdfMerge() {
	const [files, setFiles] = useState<FileEntry[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const addFiles = (newFiles: File[]) => {
		const pdfFiles = newFiles.filter((file) => file.type === "application/pdf");
		if (pdfFiles.length === 0) return;

		setFiles((prev) => [
			...prev,
			...pdfFiles.map((file) => ({
				id: nanoid(),
				file,
			})),
		]);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		addFiles(Array.from(e.target.files));
	};

	const removeFile = (id: string) => {
		setFiles((prev) => prev.filter((entry) => entry.id !== id));
	};

	const clearFiles = () => setFiles([]);

	const reorderFiles = (newFiles: FileEntry[]) => {
		setFiles(newFiles);
	};

	const mergePdfs = async () => {
		if (files.length < 2) {
			toast("統合するには PDF ファイルを2つ以上追加してください。", {
				type: "warning",
				id: "pdf-merge-min-files",
			});
			return;
		}

		setIsLoading(true);

		try {
			const mergedPdf = await PDFDocument.create();

			for (const { file } of files) {
				const arrayBuffer = await file.arrayBuffer();
				const pdf = await PDFDocument.load(arrayBuffer);
				const copiedPages = await mergedPdf.copyPages(
					pdf,
					pdf.getPageIndices(),
				);

				for (const page of copiedPages) {
					mergedPdf.addPage(page);
				}
			}

			const mergedPdfBytes = await mergedPdf.save();
			// 型エラー回避のためにbufferをArrayBufferに変換
			const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], {
				type: "application/pdf",
			});
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = `merged_${Date.now()}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			setFiles([]);
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
			setIsLoading(false);
		}
	};

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
