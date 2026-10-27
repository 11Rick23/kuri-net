import { describe, expect, test } from "bun:test";
import {
	countUnicodeCodePoints,
	NOTEPAD_CONTENT_MAX_CODE_POINTS,
	NOTEPAD_CONTENT_TOO_LONG_ERROR,
	validateNotepadContent,
} from "@/features/tools/notepad/domain/content";

describe("notepad content", () => {
	test("空文字と改行を含む本文をそのまま受け入れる", () => {
		// 機能要件：メモ本文では空文字と改行を含む文字列を保存対象として受け入れる。
		// Given
		const content = "1行目\n\n3行目";

		// When
		const result = validateNotepadContent(content);

		// Then
		expect(result).toEqual({ ok: true, value: content });
		expect(validateNotepadContent("")).toEqual({ ok: true, value: "" });
	});

	test("文字列以外の入力を拒否する", () => {
		// 機能要件：メモ本文として文字列以外の値を受け入れない。
		// 非機能要件：実行時の入力型が不正な場合は、永続化前に判定できる。
		// Given
		const invalidValues: unknown[] = [null, undefined, 1, {}, ["メモ"]];

		// When
		const results = invalidValues.map(validateNotepadContent);

		// Then
		expect(results.every((result) => !result.ok)).toBe(true);
	});

	test("20万Unicodeコードポイントを受け入れる", () => {
		// 機能要件：上限ちょうどのメモ本文を保存対象として受け入れる。
		// Given
		const content = "🍑".repeat(NOTEPAD_CONTENT_MAX_CODE_POINTS);

		// When
		const result = validateNotepadContent(content);

		// Then
		expect(result).toEqual({ ok: true, value: content });
		expect(countUnicodeCodePoints(content)).toBe(
			NOTEPAD_CONTENT_MAX_CODE_POINTS,
		);
		expect(content.length).toBe(NOTEPAD_CONTENT_MAX_CODE_POINTS * 2);
	});

	test("20万1Unicodeコードポイントを日本語エラーで拒否する", () => {
		// 機能要件：上限を1文字超えたメモ本文を明示的なエラーで拒否する。
		// Given
		const content = "🍑".repeat(NOTEPAD_CONTENT_MAX_CODE_POINTS + 1);

		// When
		const result = validateNotepadContent(content);

		// Then
		expect(result).toEqual({
			ok: false,
			error: NOTEPAD_CONTENT_TOO_LONG_ERROR,
		});
	});
});
