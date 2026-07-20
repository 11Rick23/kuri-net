import { describe, expect, test } from "bun:test";
import {
	difficultyDefinitions,
	difficultyKeys,
	generateLogicalBoard,
	getNeighborIndices,
	getOpeningCells,
} from "@/features/tools/minesweeper/logic";

describe("完全論理式マインスイーパー", () => {
	test("各プリセットで論理検証済みの盤面を生成できる", () => {
		for (const difficulty of difficultyKeys) {
			const definition = difficultyDefinitions[difficulty];
			const board = generateLogicalBoard({
				...definition,
				difficulty,
				seed: `test-${difficulty}`,
			});
			const protectedCells = [
				board.firstIndex,
				...getNeighborIndices(board.firstIndex, board.width, board.height),
			];

			expect(board.cells.filter((cell) => cell.mine)).toHaveLength(
				definition.mineCount,
			);
			expect(protectedCells.every((index) => !board.cells[index].mine)).toBe(
				true,
			);
			expect(getOpeningCells(board, board.firstIndex).length).toBeGreaterThan(
				3,
			);
			expect(board.solutionSteps.length).toBeGreaterThan(0);
			expect(
				board.solutionSteps.every((step) =>
					step.targets.every((index) =>
						step.action === "reveal"
							? !board.cells[index].mine
							: board.cells[index].mine,
					),
				),
			).toBe(true);
		}
	});

	test("同じシードと設定から同じ盤面を再現できる", () => {
		const options = {
			...difficultyDefinitions.intermediate,
			difficulty: "intermediate" as const,
			seed: "repeatable-board",
		};
		const first = generateLogicalBoard(options);
		const second = generateLogicalBoard(options);

		expect(second.seed).toBe(first.seed);
		expect(
			second.cells.filter((cell) => cell.mine).map((cell) => cell.index),
		).toEqual(
			first.cells.filter((cell) => cell.mine).map((cell) => cell.index),
		);
	});

	test("安全な初手領域を確保できない設定は拒否する", () => {
		expect(() =>
			generateLogicalBoard({
				width: 5,
				height: 5,
				mineCount: 17,
				difficulty: "beginner",
				seed: "too-many-mines",
			}),
		).toThrow("地雷数が盤面サイズに対して多すぎます");
	});
});
