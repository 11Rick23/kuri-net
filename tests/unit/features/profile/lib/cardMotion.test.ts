import { describe, expect, test } from "bun:test";
import { dragAngle } from "@/features/profile/lib/cardMotion";

describe("名刺のドラッグ回転", () => {
	test("ホバーから掴んだ瞬間は角度を保ち、小さな移動では正面を維持する", () => {
		// 機能要件：掴んだ位置で角度が飛ばず、軽いドラッグでは裏返らない。
		// Given
		const origin = 5;
		// When
		const grabbed = dragAngle(0, 600, origin);
		const moved = dragAngle(60, 600, origin);
		// Then
		expect(grabbed).toBe(origin);
		expect(moved).toBeGreaterThan(origin);
		expect(moved).toBeLessThan(15);
	});

	test("大きく引くと裏面が少し見え、引き続けても105度を超えない", () => {
		// 機能要件：左右とも90度を超えられるが、完全には裏返らない。
		// Given
		const width = 600;
		// When / Then
		for (const direction of [-1, 1]) {
			expect(Math.abs(dragAngle(direction * 420, width, 0))).toBeGreaterThan(
				90,
			);
			expect(
				Math.abs(dragAngle(direction * 420, width, 0)),
			).toBeLessThanOrEqual(105);
			expect(dragAngle(direction * 1200, width, 0)).toBe(direction * 105);
		}
	});

	test("画面幅が違っても同じ割合だけ引けば同じ角度になる", () => {
		// 機能要件：スマホとPCでカードの大きさに応じた操作感を保つ。
		// Given / When
		const mobile = dragAngle(150, 300, 0);
		const desktop = dragAngle(300, 600, 0);
		// Then
		expect(mobile).toBe(desktop);
		expect(dragAngle(10, 0, 5)).toBe(5);
	});
});
