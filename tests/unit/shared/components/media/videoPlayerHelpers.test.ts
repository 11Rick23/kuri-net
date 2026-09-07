import { describe, expect, test } from "bun:test";
import {
	formatMediaTime,
	resolveMediaProgress,
} from "@/shared/components/media/videoPlayerHelpers";

describe("videoPlayerHelpers", () => {
	test.each([
		{ input: 0, expected: "0:00" },
		{ input: 9.9, expected: "0:09" },
		{ input: 65, expected: "1:05" },
		{ input: 3600, expected: "60:00" },
	])("再生秒数を時刻表示へ変換する: %j", ({ input, expected }) => {
		// 機能要件：動画の再生時間を分と2桁の秒で表示する。
		// Given
		const mediaTime = input;

		// When
		const result = formatMediaTime(mediaTime);

		// Then
		expect(result).toBe(expected);
	});

	test.each([
		{ condition: "NaN", input: Number.NaN },
		{ condition: "正の無限大", input: Number.POSITIVE_INFINITY },
		{ condition: "負数", input: -1 },
	])("無効な再生秒数を0:00として表示する: %j", ({ input }) => {
		// 機能要件：再生時間を取得できない間も有効な時刻表示を維持する。
		// 非機能要件：ブラウザから不正な数値を受け取っても表示へNaNやInfinityを出さない。
		// Given / When
		const result = formatMediaTime(input);

		// Then
		expect(result).toBe("0:00");
	});

	test("再生位置が動画時間を超えた場合は終端へ収める", () => {
		// 機能要件：再生位置スライダーの値は動画時間の範囲内に収める。
		// Given
		const currentTime = 120;
		const duration = 90;

		// When
		const result = resolveMediaProgress(currentTime, duration);

		// Then
		expect(result).toEqual({ max: 90, value: 90 });
	});

	test("動画時間を取得できない場合は再生位置を0にする", () => {
		// 機能要件：動画時間を取得できない間は無効な再生位置を表示しない。
		// 非機能要件：スライダーへ範囲外の値を渡さない。
		// Given
		const currentTime = 30;
		const duration = Number.NaN;

		// When
		const result = resolveMediaProgress(currentTime, duration);

		// Then
		expect(result).toEqual({ max: 0, value: 0 });
	});
});
