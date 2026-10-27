import { describe, expect, test } from "bun:test";
import {
	getNeighborIndices,
	getOpeningCells,
} from "@/features/tools/minesweeper/board";
import { difficultyFeaturesMatchDefinition } from "@/features/tools/minesweeper/difficulty";
import { generateLogicalBoard } from "@/features/tools/minesweeper/generator";
import {
	type DifficultyKey,
	difficultyDefinitions,
	difficultyKeys,
} from "@/features/tools/minesweeper/model";

describe("論理盤面生成", () => {
	test.each(difficultyKeys)("%sの条件を満たす盤面を生成する", (difficulty) => {
		// 機能要件：指定プリセットについて、初手安全領域と推論難度を満たす盤面を返す。
		// 非機能要件：固定seedでは再現可能な盤面を返す。
		// Given
		const definition = difficultyDefinitions[difficulty];

		// When
		const board = generateLogicalBoard({
			...definition,
			difficulty,
			seed: `test-${difficulty}`,
		});

		// Then
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
		expect(protectedCells.every((index) => !board.cells[index].mine)).toBe(
			true,
		);
		expect(getOpeningCells(board, board.firstIndex).length).toBeGreaterThan(3);
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
		expect(
			board.solutionSteps.every(
				(step) =>
					!/(安全です|すべて地雷です|このマスは地雷です)/.test(
						step.explanation,
					),
			),
		).toBe(true);
	});

	test("推論難度に合わせて地雷数を許容範囲内で調整する", () => {
		// 機能要件：指定地雷数で条件を満たせない場合は、許容範囲内で地雷数を調整して盤面を生成する。
		// Given / When
		const generatedBoards = difficultyKeys.map((difficulty) => {
			const definition = difficultyDefinitions[difficulty];
			return {
				definition,
				board: generateLogicalBoard({
					...definition,
					difficulty,
					seed: `test-${difficulty}`,
				}),
			};
		});

		// Then
		expect(
			generatedBoards.some(
				({ board, definition }) => board.mineCount !== definition.mineCount,
			),
		).toBe(true);
	});

	test("同じseedと設定から同じ盤面を再現する", () => {
		// 機能要件：同じ入力から地雷配置を再現できる。
		// Given
		const options = {
			...difficultyDefinitions.intermediate,
			difficulty: "intermediate" as const,
			seed: "repeatable-board",
		};

		// When
		const first = generateLogicalBoard(options);
		const second = generateLogicalBoard(options);

		// Then
		expect(second.seed).toBe(first.seed);
		expect(second.cells).toEqual(first.cells);
	});

	test.each([
		[
			"幅が小さすぎる",
			{ width: 4, height: 5, mineCount: 1, difficulty: "beginner" },
			"盤面の幅と高さは5〜20の整数で指定してください。",
		],
		[
			"高さが整数ではない",
			{ width: 5, height: 5.5, mineCount: 1, difficulty: "beginner" },
			"盤面の幅と高さは5〜20の整数で指定してください。",
		],
		[
			"安全な初手領域を確保できない",
			{ width: 5, height: 5, mineCount: 17, difficulty: "beginner" },
			"地雷数が盤面サイズに対して多すぎます。",
		],
	] as const)("%s設定を拒否する", (_label, options, error) => {
		// 機能要件：盤面生成の範囲外となる寸法・地雷数を明確なエラーで拒否する。
		// When / Then
		expect(() => generateLogicalBoard(options)).toThrow(error);
	});

	test("探索回数内で難易度条件を満たさなければ代替盤面を返さない", () => {
		// 機能要件：指定難易度を満たさない盤面を成功結果として返さない。
		// Given
		const options = {
			width: 5,
			height: 5,
			mineCount: 1,
			difficulty: "expert" as DifficultyKey,
			seed: "strict-difficulty",
			maxAttempts: 1,
		};

		// When / Then
		expect(() => generateLogicalBoard(options)).toThrow(
			"指定した推論難度の条件を満たす盤面を生成できませんでした",
		);
	});
});
