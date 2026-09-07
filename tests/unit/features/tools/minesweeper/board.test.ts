import { describe, expect, test } from "bun:test";
import {
	formatCellLabel,
	formatElapsedTime,
	getNeighborIndices,
	getOpeningCells,
	isBoardWon,
} from "@/features/tools/minesweeper/board";
import { createTestBoard } from "./testHelpers";

describe("マインスイーパー盤面", () => {
	test.each([
		["左上", 0, [1, 3, 4]],
		["上辺中央", 1, [0, 2, 3, 4, 5]],
		["中央", 4, [0, 1, 2, 3, 5, 6, 7, 8]],
	] as const)("%sの隣接マスだけを返す", (_label, index, expected) => {
		// 機能要件：盤面端を越えず、対象マスに隣接するマスを昇順で返す。
		// Given
		const width = 3;
		const height = 3;

		// When
		const neighbors = getNeighborIndices(index, width, height);

		// Then
		expect(neighbors).toEqual([...expected]);
	});

	test("空白領域と境界の数字マスをまとめて開く", () => {
		// 機能要件：0マスから開始した場合は、連続する空白と境界の安全マスを開く。
		// Given
		const board = createTestBoard(3, 3, [8]);

		// When
		const opening = getOpeningCells(board, 0);

		// Then
		expect(opening).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
	});

	test("フラグ済みマスを自動展開から除外する", () => {
		// 機能要件：空白領域の展開時も、フラグ済みマスは開かない。
		// Given
		const board = createTestBoard(3, 3, [8]);
		const blocked = new Set([1]);

		// When
		const opening = getOpeningCells(board, 0, blocked);

		// Then
		expect(opening).not.toContain(1);
		expect(opening).toContain(7);
	});

	test.each([
		["地雷", 8],
		["盤面外", 9],
	] as const)("%sからはマスを開かない", (_label, startIndex) => {
		// 機能要件：安全に開始できない位置では展開結果を空にする。
		// Given
		const board = createTestBoard(3, 3, [8]);

		// When / Then
		expect(getOpeningCells(board, startIndex)).toEqual([]);
	});

	test("すべての安全マスが開いた場合だけクリアと判定する", () => {
		// 機能要件：地雷以外の全マスが公開された状態をクリアと判定する。
		// Given
		const board = createTestBoard(2, 2, [3]);

		// When / Then
		expect(isBoardWon(board, new Set([0, 1]))).toBe(false);
		expect(isBoardWon(board, new Set([0, 1, 2]))).toBe(true);
	});

	test.each([
		[0, "00:00"],
		[61, "01:01"],
		[3_661, "61:01"],
	] as const)("%d秒を%sとして表示する", (seconds, expected) => {
		// 機能要件：経過秒数を分と秒の2桁表記へ変換する。
		// When / Then
		expect(formatElapsedTime(seconds)).toBe(expected);
	});

	test("セルの状態と補足情報を読み上げ用ラベルへ含める", () => {
		// 機能要件：位置、公開状態、初手、ヒント根拠を1つのラベルで伝える。
		// 非機能要件：盤面の色や記号を見なくてもセル状態を判別できる。
		// Given
		const board = createTestBoard(2, 2, [3]);

		// When
		const label = formatCellLabel(board, 0, {
			revealed: true,
			flagged: false,
			showMine: false,
			first: true,
			hintSource: true,
		});

		// Then
		expect(label).toBe("1行 1列、周囲の地雷 1個、初手、ヒントの根拠");
	});
});
