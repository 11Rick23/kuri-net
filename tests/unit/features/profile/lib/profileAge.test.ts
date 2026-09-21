import { describe, expect, test } from "bun:test";
import { getProfileAge } from "@/features/profile/lib/profileAge";

describe("getProfileAge", () => {
	test("日本時間で誕生日を迎えた瞬間に年齢が増える", () => {
		// 機能要件：サーバーのタイムゾーンに依存せず、11月23日の午前0時に年齢を更新する。
		// Given
		const beforeBirthday = new Date("2026-11-22T14:59:59.999Z");
		const birthday = new Date("2026-11-22T15:00:00.000Z");
		// When
		const before = getProfileAge(beforeBirthday);
		const after = getProfileAge(birthday);
		// Then
		expect(before).toBe(20);
		expect(after).toBe(21);
	});

	test("年をまたいでも、次の誕生日までは年齢が変わらない", () => {
		// 機能要件：年が変わっただけで年齢を増やさない。
		// Given
		const newYear = new Date("2026-12-31T15:00:00.000Z");
		// When
		const age = getProfileAge(newYear);
		// Then
		expect(age).toBe(21);
	});
});
