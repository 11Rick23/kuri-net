import { describe, expect, test } from "bun:test";
import { getHintPopupPosition } from "@/features/tools/minesweeper/hintPosition";
import {
	type BoardCell,
	calculateAverageDifficultyScore,
	createForcedMineBoard,
	type Deduction,
	difficultyDefinitions,
	difficultyFeaturesMatchDefinition,
	difficultyKeys,
	formatCellLabel,
	generateLogicalBoard,
	getLogicalHint,
	getNeighborIndices,
	getOpeningCells,
	type LogicalBoard,
	ruleLabels,
} from "@/features/tools/minesweeper/logic";

function createTestBoard(
	width: number,
	height: number,
	mineIndices: number[],
): LogicalBoard {
	const mines = new Set(mineIndices);
	const cells: BoardCell[] = Array.from(
		{ length: width * height },
		(_, index) => ({
			index,
			mine: mines.has(index),
			adjacentMines: mines.has(index)
				? 0
				: getNeighborIndices(index, width, height).filter((neighbor) =>
						mines.has(neighbor),
					).length,
		}),
	);
	return {
		width,
		height,
		mineCount: mineIndices.length,
		firstIndex: 0,
		seed: "test-board",
		cells,
		difficultyScore: 0,
		difficultyFeatures: {
			maxRuleCost: 0,
			averageRuleCost: 0,
			subsetCount: 0,
			subsetRatio: 0,
			enumerationCount: 0,
			enumerationRatio: 0,
			hardStepRatio: 0,
			maxSourceCount: 0,
			maxConstraintSize: 0,
			maxEnumerationConstraintSize: 0,
			maxHardStepStreak: 0,
			maxHardStepsInWindow: 0,
			scarceStepRatio: 0,
			basicStepRatio: 1,
		},
		maxRule: "remaining-mines-zero",
		solutionSteps: [],
	};
}

describe("完全論理式マインスイーパー", () => {
	test("同じ推論構成なら手数が増えても平均難易度は変わらない", () => {
		const steps: Deduction[] = [
			{
				action: "reveal",
				targets: [1],
				sources: [0],
				rule: "remaining-mines-zero",
				explanation: "",
			},
			{
				action: "reveal",
				targets: [2],
				sources: [0, 3],
				rule: "subset-difference",
				explanation: "",
			},
		];

		expect(calculateAverageDifficultyScore(steps)).toBe(200);
		expect(calculateAverageDifficultyScore([...steps, ...steps])).toBe(200);
	});

	test("推論回数が違っても平均と割合が同じなら同じ難度になる", () => {
		const features = {
			...createTestBoard(3, 2, [1]).difficultyFeatures,
			maxRuleCost: 3,
			averageRuleCost: 1.2,
			subsetCount: 1,
			subsetRatio: 0.1,
		};

		expect(difficultyFeaturesMatchDefinition(features, "intermediate")).toBe(
			true,
		);
		expect(
			difficultyFeaturesMatchDefinition(
				{ ...features, subsetCount: 100 },
				"intermediate",
			),
		).toBe(true);
	});

	test("論理的に安全と確定していないマスを地雷へ変更する", () => {
		const board = createTestBoard(3, 2, [1]);
		const revealed = new Set([0]);
		const originalClues = new Map(
			[...revealed].map((index) => [index, board.cells[index].adjacentMines]),
		);

		const forcedMineBoard = createForcedMineBoard(board, revealed, 3);

		expect(forcedMineBoard).not.toBeNull();
		if (!forcedMineBoard) return;
		expect(forcedMineBoard.cells[3].mine).toBe(true);
		expect(forcedMineBoard.cells.filter((cell) => cell.mine)).toHaveLength(
			board.mineCount,
		);
		for (const [index, adjacentMines] of originalClues) {
			expect(forcedMineBoard.cells[index].mine).toBe(false);
			expect(forcedMineBoard.cells[index].adjacentMines).toBe(adjacentMines);
		}
	});

	test("残り条件から安全と証明できるマスは地雷へ変更しない", () => {
		const board = createTestBoard(3, 2, [1]);
		const revealed = new Set([0]);

		expect(createForcedMineBoard(board, revealed, 2)).toBeNull();
	});

	test("ヒント説明を推論対象マスを隠さず画面内へ配置する", () => {
		const board = { top: 100, left: 100, width: 600, height: 500 };
		const popup = Object.defineProperties(
			{},
			{
				width: { value: 240, enumerable: false },
				height: { value: 80, enumerable: false },
			},
		) as { width: number; height: number };
		const viewport = { width: 1000, height: 800 };

		expect(
			getHintPopupPosition(
				{ top: 110, left: 360, width: 40, height: 40 },
				popup,
				board,
				viewport,
			),
		).toEqual({ top: 20, left: 260 });
		expect(
			getHintPopupPosition(
				{ top: 350, left: 650, width: 40, height: 40 },
				popup,
				board,
				viewport,
				[{ top: 260, left: 550, width: 150, height: 80 }],
			),
		).toEqual({ top: 400, left: 550 });
		expect(
			getHintPopupPosition(
				{ top: 652, left: 682, width: 36, height: 36 },
				{ width: 256, height: 78 },
				{ top: 170, left: 366, width: 548, height: 548 },
				{ width: 1280, height: 720 },
				[{ top: 580, left: 600, width: 36, height: 36 }],
			),
		).toEqual({ top: 564, left: 646 });

		const surroundedTargets = [
			{ top: 154, left: 352, width: 36, height: 36 },
			{ top: 318, left: 352, width: 36, height: 36 },
			{ top: 242, left: 420, width: 36, height: 36 },
			{ top: 242, left: 158, width: 36, height: 36 },
			{ top: 20, left: 352, width: 36, height: 36 },
			{ top: 520, left: 352, width: 36, height: 36 },
			{ top: 242, left: 610, width: 36, height: 36 },
			{ top: 242, left: 20, width: 36, height: 36 },
		];
		const searchedPosition = getHintPopupPosition(
			{ top: 250, left: 350, width: 40, height: 40 },
			{ width: 200, height: 100 },
			{ top: 100, left: 100, width: 600, height: 400 },
			{ width: 800, height: 600 },
			surroundedTargets,
		);
		const searchedPopup = {
			...searchedPosition,
			width: 200,
			height: 100,
		};
		expect(
			surroundedTargets.every((target) => {
				const overlapWidth = Math.max(
					0,
					Math.min(
						searchedPopup.left + searchedPopup.width,
						target.left + target.width,
					) - Math.max(searchedPopup.left, target.left),
				);
				const overlapHeight = Math.max(
					0,
					Math.min(
						searchedPopup.top + searchedPopup.height,
						target.top + target.height,
					) - Math.max(searchedPopup.top, target.top),
				);
				return overlapWidth * overlapHeight === 0;
			}),
		).toBe(true);
	});

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
			expect(
				board.solutionSteps.every(
					(step) =>
						!/(安全です|すべて地雷です|このマスは地雷です)/.test(
							step.explanation,
						),
				),
			).toBe(true);
		}
		expect(adjustedMineCount).toBe(true);
		expect(
			Object.values(ruleLabels).every(
				(label) => !/(すべて地雷|残り地雷が0)/.test(label),
			),
		).toBe(true);
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

	test("ヒントは最も単純な推論の根拠だけを返す", () => {
		const board = generateLogicalBoard({
			...difficultyDefinitions.expert,
			difficulty: "expert",
			seed: "hint-source-test",
		});
		const revealed = new Set(getOpeningCells(board, board.firstIndex));
		const flagged = new Set<number>();
		let foundEnumeration = false;

		for (const expectedStep of board.solutionSteps) {
			const hint = getLogicalHint(board, revealed, flagged);
			expect(hint).not.toBeNull();
			if (!hint) break;

			expect(hint.rule).toBe(expectedStep.rule);
			expect(hint.sources.every((index) => revealed.has(index))).toBe(true);
			expect(hint.targets.some((index) => hint.sources.includes(index))).toBe(
				false,
			);
			if (
				hint.rule === "remaining-mines-zero" ||
				hint.rule === "all-unknown-are-mines"
			) {
				expect(hint.sources).toHaveLength(1);
			}
			if (hint.rule === "constraint-enumeration") foundEnumeration = true;

			for (const source of hint.sources) {
				expect(
					formatCellLabel(board, source, {
						revealed: true,
						flagged: false,
						showMine: false,
						first: false,
						hintSource: true,
					}),
				).toContain("ヒントの根拠");
			}

			if (expectedStep.action === "flag") {
				for (const index of expectedStep.targets) flagged.add(index);
			} else {
				for (const index of expectedStep.targets) {
					expect(createForcedMineBoard(board, revealed, index)).toBeNull();
					for (const opened of getOpeningCells(board, index, flagged)) {
						revealed.add(opened);
					}
				}
			}
		}

		expect(foundEnumeration).toBe(true);
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
