import { describe, expect, test } from "bun:test";
import {
	difficultyDefinitions,
	difficultyFeaturesMatchDefinition,
	difficultyKeys,
	generateLogicalBoard,
	getNeighborIndices,
	getOpeningCells,
} from "@/features/tools/minesweeper/logic";

describe("完全論理式マインスイーパー", () => {
	test("各プリセットで論理検証済みの盤面を生成できる", () => {
		let adjustedMineCount = false;
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

			const mineCount = board.cells.filter((cell) => cell.mine).length;
			expect(mineCount).toBe(board.mineCount);
			expect(mineCount).toBeGreaterThanOrEqual(
				Math.max(1, Math.floor(definition.mineCount * 0.7)),
			);
			expect(mineCount).toBeLessThanOrEqual(
				Math.min(
					definition.width * definition.height - 9,
					Math.ceil(definition.mineCount * 1.35),
				),
			);
			if (mineCount !== definition.mineCount) adjustedMineCount = true;
			expect(protectedCells.every((index) => !board.cells[index].mine)).toBe(
				true,
			);
			expect(getOpeningCells(board, board.firstIndex).length).toBeGreaterThan(
				3,
			);
			expect(board.solutionSteps.length).toBeGreaterThan(0);
			expect(
				difficultyFeaturesMatchDefinition(board.difficultyFeatures, difficulty),
			).toBe(true);
			for (const otherDifficulty of difficultyKeys) {
				if (otherDifficulty === difficulty) continue;
				expect(
					difficultyFeaturesMatchDefinition(
						board.difficultyFeatures,
						otherDifficulty,
					),
				).toBe(false);
			}
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
		expect(adjustedMineCount).toBe(true);
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

	test("難度条件を満たさない代替盤面は返さない", () => {
		expect(() =>
			generateLogicalBoard({
				width: 5,
				height: 5,
				mineCount: 1,
				difficulty: "expert",
				seed: "strict-difficulty",
				maxAttempts: 1,
			}),
		).toThrow("指定した論理難度の条件を満たす盤面を生成できませんでした");
	});
});
