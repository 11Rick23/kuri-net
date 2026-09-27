import { describe, expect, test } from "bun:test";
import {
	constrainNote,
	NOTE_HEIGHT,
	NOTE_WIDTH,
	placeNote,
} from "@/features/profile/lib/profileNotePosition";

describe("Profileメモの配置", () => {
	test("本文を覆わず、左右の余白へ順に配置する", () => {
		// 機能要件：同じ位置の話題を開いても、二枚のメモは本文と互いを覆わない。
		// Given
		const input = {
			left: 280,
			right: 1000,
			top: 380,
			viewport: { width: 1280, height: 720 },
			occupied: [],
		};
		// When
		const first = placeNote(input);
		const second = placeNote({ ...input, occupied: [first] });
		// Then
		expect(first.x).toBeGreaterThanOrEqual(input.right);
		expect(second.x + NOTE_WIDTH).toBeLessThanOrEqual(input.left);
		expect(second.x + NOTE_WIDTH).toBeLessThan(first.x);
	});

	test("縦に空きがある場合は既存のメモと重ならない位置を使う", () => {
		// 機能要件：左右が埋まっても、縦の余白に三枚目を配置できる。
		// Given
		const input = {
			left: 280,
			right: 1000,
			top: 110,
			viewport: { width: 1280, height: 1000 },
			occupied: [
				{ x: 1016, y: 110 },
				{ x: 16, y: 110 },
			],
		};
		// When
		const result = placeNote(input);
		// Then
		expect(result.y).toBeGreaterThanOrEqual(110 + NOTE_HEIGHT);
		expect(result.y + NOTE_HEIGHT).toBeLessThan(input.viewport.height);
	});

	test("ドラッグや画面縮小後もメモをページの範囲内に保つ", () => {
		// 機能要件：ページの上下左右を越える移動を制限する。
		// Given
		const viewport = { width: 1100, height: 520 };
		// When
		const upper = constrainNote({ x: -800, y: -500 }, viewport);
		const lower = constrainNote({ x: 2000, y: 1000 }, viewport);
		// Then
		expect(upper.x).toBeGreaterThan(0);
		expect(upper.y).toBeGreaterThanOrEqual(104);
		expect(lower.x + NOTE_WIDTH).toBeLessThan(viewport.width);
		expect(lower.y + NOTE_HEIGHT).toBeLessThan(viewport.height);
	});

	test("スクロール先で開くメモはページ座標で配置する", () => {
		// 機能要件：現在の表示範囲内へ配置し、他のスクロール位置で開いたメモを同じ場所に重ねない。
		// Given
		const viewport = { width: 1280, height: 720, scrollY: 1400 };
		// When
		const note = placeNote({
			left: 280,
			right: 1000,
			top: 1900,
			viewport,
			occupied: [{ x: 1016, y: 380 }],
		});
		// Then
		expect(note.x).toBe(1016);
		expect(note.y).toBeGreaterThanOrEqual(viewport.scrollY + 104);
		expect(note.y + NOTE_HEIGHT).toBeLessThan(
			viewport.scrollY + viewport.height,
		);
	});

	test("ページ途中のメモをリサイズしても画面の上端へ引き戻さない", () => {
		// 機能要件：横幅を調整するときも保存したページ上の高さを維持する。
		// Given
		const note = { x: 1016, y: 1600 };
		// When
		const result = constrainNote(note, { width: 1100, height: 3200 });
		// Then
		expect(result.y).toBe(1600);
		expect(result.x + NOTE_WIDTH).toBeLessThan(1100);
	});
});
