import { expect, spyOn, test } from "bun:test";
import { createCardCorners } from "@/features/profile/lib/cardGeometry";

test("三角関数に実行環境ごとの微小差があっても同じ側面の属性を生成する", () => {
	// 機能要件：SSR とブラウザで丸角の位置が一致し、ハイドレーション警告が出ない。
	// Given
	const expected = createCardCorners();
	const cos = Math.cos;
	const sin = Math.sin;
	const cosMock = spyOn(Math, "cos").mockImplementation(
		(angle) => cos(angle) + 1e-15,
	);
	const sinMock = spyOn(Math, "sin").mockImplementation(
		(angle) => sin(angle) - 1e-15,
	);
	try {
		// When
		const actual = createCardCorners();
		// Then
		expect(actual).toEqual(expected);
	} finally {
		cosMock.mockRestore();
		sinMock.mockRestore();
	}
});
