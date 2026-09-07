import { createBoardFromMines } from "@/features/tools/minesweeper/board";

export function createTestBoard(
	width: number,
	height: number,
	mineIndices: number[],
	firstIndex = 0,
) {
	return createBoardFromMines(
		width,
		height,
		mineIndices,
		firstIndex,
		"test-board",
	);
}
