import { describe, expect, test } from "bun:test";
import { createCardMotion, dragAngle } from "@/features/profile/lib/cardMotion";

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
		expect(moved).toBeLessThan(45);
	});

	test("左右とも角度制限なく何周でも回せる", () => {
		// 機能要件：カード幅の2倍の移動で1回転し、360度を超えても回転を続ける。
		// Given
		const width = 600;
		// When / Then
		for (const direction of [-1, 1]) {
			expect(dragAngle(direction * width, width, 0)).toBe(direction * 180);
			expect(dragAngle(direction * width * 2, width, 0)).toBe(direction * 360);
			expect(dragAngle(direction * width * 6, width, 0)).toBe(direction * 1080);
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

describe("名刺の操作の切り替え", () => {
	test("ドラッグ中はホバーや別の指の移動が角度に割り込まない", () => {
		// 機能要件：掴んだポインターだけがドラッグ中の角度を決定する。
		// Given
		const motion = createCardMotion();
		motion.start(1, 100, 100, 600, 400);
		motion.move(1, 200, 100);
		motion.advance(16);
		const dragged = { ...motion.angle };
		// When
		motion.hover(-5, -5);
		motion.move(2, 0, 0);
		motion.advance(16);
		// Then
		expect(motion.angle).toEqual(dragged);
		expect(motion.pointerId).toBe(1);
	});

	test("ホバーのアニメーション途中で掴んでも表示中の角度から動き始める", () => {
		// 機能要件：未到達の移動先へジャンプせず、見えている位置で掴める。
		// Given
		const motion = createCardMotion();
		motion.hover(5, 5);
		motion.advance(16);
		const visible = { ...motion.angle };
		// When
		motion.start(1, 100, 100, 600, 400);
		motion.move(1, 100, 100);
		motion.advance(16);
		// Then
		expect(visible.x).toBeLessThan(5);
		expect(motion.angle).toEqual(visible);
	});

	test("ドラッグの入力が止まった後に遅れて動き続けない", () => {
		// 機能要件：各フレームで最新のドラッグ位置へ追従し、停止位置を維持する。
		// Given
		const motion = createCardMotion();
		motion.start(1, 0, 0, 600, 400);
		motion.move(1, 100, 40);
		motion.move(1, 200, 80);
		// When
		motion.advance(16);
		const stopped = { ...motion.angle };
		motion.advance(16);
		// Then
		expect(motion.angle).toEqual(stopped);
		expect(stopped.y).toBe(dragAngle(200, 600, 0));
	});

	test("中断後の古いドラッグ入力を無視して滑らかに正面へ戻る", () => {
		// 機能要件：キャプチャ解除後の入力で再びドラッグ状態にならない。
		// Given
		const motion = createCardMotion();
		motion.start(1, 0, 0, 600, 400);
		motion.move(1, 200, 0);
		motion.advance(16);
		const before = motion.angle.y;
		// When
		motion.reset();
		motion.move(1, 600, 0);
		motion.advance(16);
		// Then
		expect(motion.pointerId).toBeUndefined();
		expect(motion.angle.y).toBeGreaterThan(0);
		expect(motion.angle.y).toBeLessThan(before);
	});
});

test("フレーム時刻が操作開始時刻より前でも逆方向に動かない", () => {
	// 機能要件：フレーム内で操作が始まった場合も初動が逆転しない。
	// Given
	const motion = createCardMotion();
	motion.hover(5, 5);
	// When
	motion.advance(-2);
	// Then
	expect(motion.angle).toEqual({ x: 0, y: 0 });
});

describe("回転後の表面への復帰", () => {
	test.each([800, -800, 1080, -1080, 190, -190])(
		"%i度まで回しても半周以内で表面へ戻る",
		(rotation) => {
			// 機能要件：何周回しても見た目を保ったまま最寄りの正面へ戻る。
			// Given
			const motion = createCardMotion();
			motion.start(1, 0, 0, 360, 360);
			motion.move(1, rotation * 2, -rotation * 2);
			motion.advance(16);
			const before = { ...motion.angle };
			// When
			motion.reset();
			// Then
			for (const axis of ["x", "y"] as const) {
				expect(Math.abs(motion.angle[axis])).toBeLessThanOrEqual(180);
				expect(Math.sin((motion.angle[axis] * Math.PI) / 180)).toBeCloseTo(
					Math.sin((before[axis] * Math.PI) / 180),
				);
				expect(Math.cos((motion.angle[axis] * Math.PI) / 180)).toBeCloseTo(
					Math.cos((before[axis] * Math.PI) / 180),
				);
			}
			for (let frame = 0; frame < 90; frame++) motion.advance(16);
			expect(motion.angle).toEqual({ x: 0, y: 0 });
		},
	);

	test("復帰途中に掴み直しても現在の角度から続けて回せる", () => {
		// 機能要件：表面への復帰を中断しても、前の周数へ跳ね戻らない。
		// Given
		const motion = createCardMotion();
		motion.start(1, 0, 0, 360, 360);
		motion.move(1, 1600, 0);
		motion.advance(16);
		motion.reset();
		motion.advance(16);
		const visible = motion.angle.y;
		// When
		motion.start(2, 100, 100, 360, 360);
		motion.move(2, 820, 100);
		motion.advance(16);
		// Then
		expect(motion.angle.y).toBeCloseTo(visible + 360);
	});
});

describe("名刺を離した後の慣性", () => {
	test.each([-1, 1])(
		"方向%iへ素早く離すと回り続け、減速後に表へ戻る",
		(direction) => {
			// 機能要件：投げた方向と勢いを保ち、ホバーに邪魔されず最後は正面に止まる。
			// Given
			const motion = createCardMotion();
			motion.start(1, 0, 0, 360, 360, 0);
			motion.move(1, direction * 30, 0, 30);
			motion.advance(16);
			const released = motion.angle.y;
			// When
			motion.release(32);
			motion.hover(-5, -5);
			motion.advance(16);
			const first = motion.angle.y;
			motion.advance(16);
			const second = motion.angle.y;
			// Then
			expect((first - released) * direction).toBeGreaterThan(0);
			expect(Math.abs(second - first)).toBeLessThan(Math.abs(first - released));
			for (let frame = 0; frame < 300; frame++) motion.advance(16);
			expect(motion.angle).toEqual({ x: 0, y: 0 });
			expect(motion.settling).toBe(false);
		},
	);

	test("指を止めてから離した場合は古い勢いで回転しない", () => {
		// 機能要件：離す直前に止まっていれば、投げずに正面へ戻る。
		// Given
		const motion = createCardMotion();
		motion.start(1, 0, 0, 360, 360, 0);
		motion.move(1, 30, 0, 30);
		motion.advance(16);
		const before = motion.angle.y;
		// When
		motion.release(200);
		motion.advance(16);
		// Then
		expect(motion.angle.y).toBeGreaterThan(0);
		expect(motion.angle.y).toBeLessThan(before);
	});

	test("回転中のカードを掴むとその場で慣性が止まる", () => {
		// 機能要件：投げたカードを掴み直しても角度が飛ばず、動き続けない。
		// Given
		const motion = createCardMotion();
		motion.start(1, 0, 0, 360, 360, 0);
		motion.move(1, 60, 0, 30);
		motion.advance(16);
		motion.release(32);
		motion.advance(80);
		const caught = { ...motion.angle };
		// When
		motion.start(2, 100, 100, 360, 360, 120);
		motion.advance(16);
		motion.advance(16);
		// Then
		expect(motion.angle).toEqual(caught);
		expect(motion.settling).toBe(false);
	});
});
