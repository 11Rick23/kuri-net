import { describe, expect, test } from "bun:test";
import { createForcedMineBoard } from "@/features/tools/minesweeper/forcedMine";
import { createTestBoard } from "@/features/tools/minesweeper/testHelpers";

describe("未確定マスの強制地雷化", () => {
	test("安全と証明されていない対象を地雷にした互換盤面を返す", () => {
		// 機能要件：公開済みの手掛かりと総地雷数を保ったまま、未確定対象を地雷にできる。
		// Given
		const board = createTestBoard(3, 2, [1]);
		const revealed = new Set([0]);
		const originalClue = board.cells[0].adjacentMines;

		// When
		const forced = createForcedMineBoard(board, revealed, 3);

		// Then
		expect(forced).not.toBeNull();
		expect(forced?.cells[3].mine).toBe(true);
		expect(forced?.cells.filter((cell) => cell.mine)).toHaveLength(
			board.mineCount,
		);
		expect(forced?.cells[0].mine).toBe(false);
		expect(forced?.cells[0].adjacentMines).toBe(originalClue);
	});

	test("すべての条件で安全な対象は地雷へ変更しない", () => {
		// 機能要件：公開済み条件から安全と証明できる対象では互換盤面を作らない。
		// Given
		const board = createTestBoard(3, 2, [1]);
		const revealed = new Set([0]);

		// When / Then
		expect(createForcedMineBoard(board, revealed, 2)).toBeNull();
	});

	test.each([
		["公開済み", 0],
		["盤面外", 6],
	] as const)("%sの対象では盤面を変更しない", (_label, targetIndex) => {
		// 機能要件：地雷化の対象として無効な位置を拒否する。
		// Given
		const board = createTestBoard(3, 2, [1]);
		const revealed = new Set([0]);

		// When / Then
		expect(createForcedMineBoard(board, revealed, targetIndex)).toBeNull();
	});
});
