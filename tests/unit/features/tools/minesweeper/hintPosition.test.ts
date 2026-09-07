import { describe, expect, test } from "bun:test";
import { getHintPopupPosition } from "@/features/tools/minesweeper/hintPosition";

describe("ヒントポップアップ配置", () => {
	test.each([
		[
			"上側に空間がある",
			{
				anchor: { top: 110, left: 360, width: 40, height: 40 },
				popup: { width: 240, height: 80 },
				board: { top: 100, left: 100, width: 600, height: 500 },
				viewport: { width: 1_000, height: 800 },
				targets: [],
				expected: { top: 20, left: 260 },
			},
		],
		[
			"近い候補が対象マスを隠す",
			{
				anchor: { top: 350, left: 650, width: 40, height: 40 },
				popup: { width: 240, height: 80 },
				board: { top: 100, left: 100, width: 600, height: 500 },
				viewport: { width: 1_000, height: 800 },
				targets: [{ top: 260, left: 550, width: 150, height: 80 }],
				expected: { top: 400, left: 550 },
			},
		],
	] as const)("%s場合に画面内の位置を返す", (_label, scenario) => {
		// 機能要件：ヒント元に近く、対象を隠さない画面内の位置を選ぶ。
		// When
		const position = getHintPopupPosition(
			scenario.anchor,
			scenario.popup,
			scenario.board,
			scenario.viewport,
			[...scenario.targets],
		);

		// Then
		expect(position).toEqual(scenario.expected);
	});

	test("周囲に候補が多い場合も対象と重ならない位置を探索する", () => {
		// 機能要件：基本候補が塞がれていても、画面内を探索して対象を覆わない位置を返す。
		// Given
		const targets = [
			{ top: 154, left: 352, width: 36, height: 36 },
			{ top: 318, left: 352, width: 36, height: 36 },
			{ top: 242, left: 420, width: 36, height: 36 },
			{ top: 242, left: 158, width: 36, height: 36 },
		];
		const popup = { width: 200, height: 100 };

		// When
		const position = getHintPopupPosition(
			{ top: 250, left: 350, width: 40, height: 40 },
			popup,
			{ top: 100, left: 100, width: 600, height: 400 },
			{ width: 800, height: 600 },
			targets,
		);

		// Then
		for (const target of targets) {
			const overlapWidth = Math.max(
				0,
				Math.min(position.left + popup.width, target.left + target.width) -
					Math.max(position.left, target.left),
			);
			const overlapHeight = Math.max(
				0,
				Math.min(position.top + popup.height, target.top + target.height) -
					Math.max(position.top, target.top),
			);
			expect(overlapWidth * overlapHeight).toBe(0);
		}
	});
});
