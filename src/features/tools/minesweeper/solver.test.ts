import { describe, expect, test } from "bun:test";
import {
	formatCellLabel,
	getOpeningCells,
} from "@/features/tools/minesweeper/board";
import { createForcedMineBoard } from "@/features/tools/minesweeper/forcedMine";
import { generateLogicalBoard } from "@/features/tools/minesweeper/generator";
import {
	difficultyDefinitions,
	ruleLabels,
} from "@/features/tools/minesweeper/model";
import {
	getLogicalHint,
	solveBoard,
} from "@/features/tools/minesweeper/solver";
import { createTestBoard } from "@/features/tools/minesweeper/testHelpers";

describe("論理解法とヒント", () => {
	test("既知の地雷を除いた残りの隣接マスを安全と判定する", () => {
		// 機能要件：数字マスの必要地雷数をフラグが満たした場合、残りを公開候補として返す。
		// Given
		const board = createTestBoard(2, 2, [3]);
		const revealed = new Set([0]);
		const flagged = new Set([3]);

		// When
		const hint = getLogicalHint(board, revealed, flagged);

		// Then
		expect(hint).toMatchObject({
			action: "reveal",
			targets: [1, 2],
			sources: [0],
			rule: "remaining-mines-zero",
		});
	});

	test("残る未公開マスがすべて地雷ならフラグ候補として返す", () => {
		// 機能要件：数字マスの残り地雷数と未公開数が一致した場合、対象を地雷候補として返す。
		// Given
		const board = createTestBoard(2, 2, [3]);
		const revealed = new Set([0, 1, 2]);

		// When
		const hint = getLogicalHint(board, revealed, new Set());

		// Then
		expect(hint).toMatchObject({
			action: "flag",
			targets: [3],
			rule: "all-unknown-are-mines",
		});
	});

	test("矛盾したフラグ状態ではヒントを返さない", () => {
		// 機能要件：公開数字より多くフラグが置かれた矛盾状態を推論結果として提示しない。
		// Given
		const board = createTestBoard(2, 2, [3]);

		// When / Then
		expect(getLogicalHint(board, new Set([0]), new Set([1, 2]))).toBeNull();
	});

	test("初手展開だけで安全マスがすべて開く盤面を完答と判定する", () => {
		// 機能要件：初手の連鎖展開で全安全マスが開いた盤面を解決済みとする。
		// Given
		const board = createTestBoard(3, 3, [8]);

		// When
		const result = solveBoard(board);

		// Then
		expect(result.solved).toBe(true);
		expect(result.contradiction).toBe(false);
		expect(result.progress).toBe(1);
	});

	test("熟練盤面を根拠付きヒントだけで最後まで解ける", () => {
		// 機能要件：熟練難度では安全性を保証した根拠付きヒントを、クリアまで提示できる。
		// 非機能要件：固定seedで推論系列を決定的に検証する。
		// Given
		const board = generateLogicalBoard({
			...difficultyDefinitions.expert,
			difficulty: "expert",
			seed: "hint-source-test",
		});
		const revealed = new Set(getOpeningCells(board, board.firstIndex));
		const flagged = new Set<number>();
		const observedRules = new Set<string>();
		const safeCellCount = board.cells.length - board.mineCount;
		let hintCount = 0;

		// When
		while (
			revealed.size < safeCellCount &&
			hintCount < board.cells.length * 2
		) {
			const hint = getLogicalHint(board, revealed, flagged);
			expect(hint).not.toBeNull();
			if (!hint) break;
			hintCount += 1;
			observedRules.add(hint.rule);
			expect(hint.sources.every((index) => revealed.has(index))).toBe(true);
			expect(hint.targets.every((index) => !hint.sources.includes(index))).toBe(
				true,
			);
			if (
				hint.rule === "remaining-mines-zero" ||
				hint.rule === "all-unknown-are-mines"
			) {
				expect(hint.sources).toHaveLength(1);
			}
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
			if (hint.action === "flag") {
				for (const index of hint.targets) {
					expect(board.cells[index].mine).toBe(true);
					flagged.add(index);
				}
			} else {
				for (const index of hint.targets) {
					expect(createForcedMineBoard(board, revealed, index)).toBeNull();
					for (const opened of getOpeningCells(board, index, flagged)) {
						revealed.add(opened);
					}
				}
			}
		}

		// Then
		expect(revealed.size).toBe(safeCellCount);
		expect(hintCount).toBeLessThan(board.cells.length * 2);
		expect(observedRules).toContain("constraint-enumeration");
	});

	test("推論ルール名を利用者向けの簡潔な表現で返す", () => {
		// 機能要件：ヒント見出しには内部条件を逐語的に表した文言を使用しない。
		// Given / When
		const labels = Object.values(ruleLabels);

		// Then
		expect(
			labels.every((label) => !/(すべて地雷|残り地雷が0)/.test(label)),
		).toBe(true);
	});
});
