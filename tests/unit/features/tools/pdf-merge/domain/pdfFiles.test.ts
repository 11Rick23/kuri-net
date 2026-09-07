import { describe, expect, test } from "bun:test";
import { PDFDocument } from "pdf-lib";
import {
	createFileEntries,
	formatFileSize,
	mergePdfFiles,
	parseReorderIndex,
	removeFileEntriesByID,
	reorderFileEntries,
	selectPdfFiles,
} from "@/features/tools/pdf-merge/domain/pdfFiles";
import type { FileEntry } from "@/features/tools/pdf-merge/types";

function createFile(name: string, type = "application/pdf") {
	return new File([name], name, { type });
}

async function createPdfFile(
	name: string,
	pageSizes: ReadonlyArray<readonly [number, number]>,
) {
	const document = await PDFDocument.create();

	for (const [width, height] of pageSizes) {
		document.addPage([width, height]);
	}

	return new File([Uint8Array.from(await document.save())], name, {
		type: "application/pdf",
	});
}

describe("PDF file domain", () => {
	test("PDFだけを元の順序で選別する", () => {
		// 機能要件：追加されたファイルからPDFだけを選び、選択順を維持する。
		// Given
		const firstPdf = createFile("first.pdf");
		const image = createFile("image.png", "image/png");
		const secondPdf = createFile("second.pdf");

		// When
		const selected = selectPdfFiles([firstPdf, image, secondPdf]);

		// Then
		expect(selected).toEqual([firstPdf, secondPdf]);
	});

	test("選別したPDFへ一意なIDを付ける", () => {
		// 機能要件：一覧表示と並び替えに使用するIDを各PDFへ付与する。
		// Given
		const files = [createFile("first.pdf"), createFile("second.pdf")];
		let nextID = 0;

		// When
		const entries = createFileEntries(files, () => `pdf-${nextID++}`);

		// Then
		expect(entries).toEqual([
			{ id: "pdf-0", file: files[0] },
			{ id: "pdf-1", file: files[1] },
		]);
	});

	test("指定したPDFを移動し、入力配列は変更しない", () => {
		// 機能要件：PDFを指定位置へ並び替える。
		// 非機能要件：呼び出し元が保持する配列を直接変更しない。
		// Given
		const entries: FileEntry[] = [
			{ id: "a", file: createFile("a.pdf") },
			{ id: "b", file: createFile("b.pdf") },
			{ id: "c", file: createFile("c.pdf") },
		];

		// When
		const reordered = reorderFileEntries(entries, 0, 2);

		// Then
		expect(reordered?.map(({ id }) => id)).toEqual(["b", "c", "a"]);
		expect(entries.map(({ id }) => id)).toEqual(["a", "b", "c"]);
	});

	test.each([
		[-1, 0],
		[0, -1],
		[3, 0],
		[0, 3],
		[1, 1],
		[0.5, 1],
	] as const)("範囲外または同一位置の並び替えを無視する", (from, to) => {
		// 機能要件：存在しない位置や移動を伴わない指定では一覧を変更しない。
		// Given
		const entries: FileEntry[] = [
			{ id: "a", file: createFile("a.pdf") },
			{ id: "b", file: createFile("b.pdf") },
			{ id: "c", file: createFile("c.pdf") },
		];

		// When / Then
		expect(reorderFileEntries(entries, from, to)).toBeNull();
	});

	test.each([
		["0", 3, 0],
		["2", 3, 2],
		["", 3, null],
		["-1", 3, null],
		["1.5", 3, null],
		["3", 3, null],
		["01", 3, null],
	] as const)(
		"ドラッグ位置 %s を一覧件数に対して検証する",
		(value, count, expected) => {
			// 機能要件：内部ドラッグの位置は10進整数かつ現在の一覧範囲内だけ受け入れる。
			// Given / When
			const index = parseReorderIndex(value, count);

			// Then
			expect(index).toBe(expected);
		},
	);

	test("結合開始後に追加されたPDFを完了時に残す", () => {
		// 機能要件：PDF結合の完了時は開始時の対象だけを一覧から除き、処理中に追加されたPDFを保持する。
		// 非機能要件：非同期処理の開始後に変化した一覧を一括削除しない。
		// Given
		const entries: FileEntry[] = [
			{ id: "merging-a", file: createFile("a.pdf") },
			{ id: "merging-b", file: createFile("b.pdf") },
			{ id: "added-later", file: createFile("later.pdf") },
		];
		const mergingIDs = new Set(["merging-a", "merging-b"]);

		// When
		const remaining = removeFileEntriesByID(entries, mergingIDs);

		// Then
		expect(remaining.map(({ id }) => id)).toEqual(["added-later"]);
		expect(entries).toHaveLength(3);
	});

	test("複数PDFの全ページをファイル順とページ順を保って結合する", async () => {
		// 機能要件：複数PDFの全ページを選択順のまま1つのPDFへ結合する。
		// Given
		const first = await createPdfFile("first.pdf", [
			[200, 300],
			[210, 310],
		]);
		const second = await createPdfFile("second.pdf", [[400, 500]]);

		// When
		const mergedBytes = await mergePdfFiles([first, second]);
		const merged = await PDFDocument.load(mergedBytes);

		// Then
		expect(merged.getPages().map((page) => page.getSize())).toEqual([
			{ width: 200, height: 300 },
			{ width: 210, height: 310 },
			{ width: 400, height: 500 },
		]);
	});

	test("PDFが2つ未満の場合は結合を拒否する", async () => {
		// 機能要件：結合対象が2つ未満の場合はPDFを生成しない。
		// Given
		const file = await createPdfFile("only.pdf", [[200, 300]]);

		// When / Then
		expect(mergePdfFiles([file])).rejects.toThrow(
			"PDFファイルを2つ以上指定してください。",
		);
	});

	test.each([
		[0, "0.00 KB"],
		[1024, "1.00 KB"],
		[1024 * 1024, "1024.00 KB"],
		[2 * 1024 * 1024, "2.00 MB"],
	] as const)("ファイルサイズを読みやすい単位で表示する", (size, expected) => {
		// 機能要件：PDFのバイト数をKBまたはMBの表示へ変換する。
		// Given / When
		const formatted = formatFileSize(size);

		// Then
		expect(formatted).toBe(expected);
	});
});
