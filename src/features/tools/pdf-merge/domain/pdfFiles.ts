import { PDFDocument } from "pdf-lib";
import type { FileEntry } from "@/features/tools/pdf-merge/types";

export const PDF_MIME_TYPE = "application/pdf";
export const PDF_REORDER_DATA_TYPE = "application/x-kuri-net-pdf-entry-index";

export function selectPdfFiles(files: Iterable<File>): File[] {
	return Array.from(files).filter((file) => file.type === PDF_MIME_TYPE);
}

export function createFileEntries(
	files: readonly File[],
	createID: () => string,
): FileEntry[] {
	return files.map((file) => ({ id: createID(), file }));
}

export function parseReorderIndex(
	value: string,
	fileCount: number,
): number | null {
	if (!/^(0|[1-9]\d*)$/.test(value)) {
		return null;
	}

	const index = Number(value);

	if (!Number.isSafeInteger(index) || index < 0 || index >= fileCount) {
		return null;
	}

	return index;
}

export function reorderFileEntries(
	files: readonly FileEntry[],
	fromIndex: number,
	toIndex: number,
): FileEntry[] | null {
	if (
		!Number.isSafeInteger(fromIndex) ||
		!Number.isSafeInteger(toIndex) ||
		fromIndex < 0 ||
		toIndex < 0 ||
		fromIndex >= files.length ||
		toIndex >= files.length ||
		fromIndex === toIndex
	) {
		return null;
	}

	const reordered = [...files];
	const [moved] = reordered.splice(fromIndex, 1);

	if (!moved) {
		return null;
	}

	reordered.splice(toIndex, 0, moved);
	return reordered;
}

export function removeFileEntriesByID(
	files: readonly FileEntry[],
	removedIDs: ReadonlySet<string>,
): FileEntry[] {
	return files.filter(({ id }) => !removedIDs.has(id));
}

export function formatFileSize(size: number): string {
	return size > 1024 * 1024
		? `${(size / 1024 / 1024).toFixed(2)} MB`
		: `${(size / 1024).toFixed(2)} KB`;
}

export async function mergePdfFiles(
	files: readonly File[],
): Promise<Uint8Array> {
	if (files.length < 2) {
		throw new Error("PDFファイルを2つ以上指定してください。");
	}

	const mergedPdf = await PDFDocument.create();

	for (const file of files) {
		const sourcePdf = await PDFDocument.load(await file.arrayBuffer());
		const copiedPages = await mergedPdf.copyPages(
			sourcePdf,
			sourcePdf.getPageIndices(),
		);

		for (const page of copiedPages) {
			mergedPdf.addPage(page);
		}
	}

	return mergedPdf.save();
}
