import { describe, expect, test } from "bun:test";
import { constrainNotePosition } from "@/features/profile/lib/notePosition";

describe("constrainNotePosition", () => {
	test("メモを四辺の外へ移動しても、ヘッダーと画面端の内側に収まる", () => {
		// 機能要件：移動後もメモ全体と閉じる操作が画面内に残る。
		// Given
		const origin = { left: 900, top: 160, width: 350, height: 280 };
		const viewport = { width: 1440, height: 900, top: 104 };
		// When
		const topLeft = constrainNotePosition(
			{ x: -2000, y: -2000 },
			origin,
			viewport,
		);
		const bottomRight = constrainNotePosition(
			{ x: 2000, y: 2000 },
			origin,
			viewport,
		);
		// Then
		expect(topLeft).toEqual({ x: -884, y: -56 });
		expect(bottomRight).toEqual({ x: 174, y: 444 });
	});

	test("表示領域より大きいメモでも、タイトルと閉じる操作のある上端を優先する", () => {
		// 機能要件：画面が縮小した場合も、メモの上端を見失わない。
		// Given
		const origin = { left: 500, top: 400, width: 350, height: 800 };
		// When
		const position = constrainNotePosition({ x: 0, y: 0 }, origin, {
			width: 320,
			height: 600,
			top: 88,
		});
		// Then
		expect(position).toEqual({ x: -484, y: -312 });
	});
});
