import { describe, expect, test } from "bun:test";
import {
	DISPLAY_NAME_MAX_LENGTH,
	validateDisplayName,
} from "@/features/auth/shared/displayName";

describe("validateDisplayName", () => {
	test.each(["くりくり", "kuri 🍑", "表示 名"])(
		"日本語・絵文字・単語間の空白を含む表示名を受け入れる: %s",
		(value) => {
			// 機能要件：表示名には日本語、絵文字、単語間の空白を使用できる。
			// Given
			const displayName = value;

			// When
			const result = validateDisplayName(displayName);

			// Then
			expect(result).toEqual({ ok: true, value: displayName });
		},
	);

	test("前後の空白を除去する", () => {
		// 機能要件：表示名の前後にある空白は保存前に除去する。
		// Given
		const displayName = "  表示 名  ";

		// When
		const result = validateDisplayName(displayName);

		// Then
		expect(result).toEqual({
			ok: true,
			value: "表示 名",
		});
	});

	test.each(["", "   "])("空の表示名を拒否する: %j", (value) => {
		// 機能要件：空文字または空白だけの表示名では登録できない。
		// Given
		const displayName = value;

		// When
		const result = validateDisplayName(displayName);

		// Then
		expect(result).toEqual({
			ok: false,
			error: "表示名を入力してください。",
		});
	});

	test.each(["名前\u0000", "名前\n"])(
		"制御文字を含む表示名を拒否する: %j",
		(value) => {
			// 機能要件：制御文字を含む表示名では登録できない。
			// Given
			const displayName = value;

			// When
			const result = validateDisplayName(displayName);

			// Then
			expect(result).toEqual({
				ok: false,
				error: "表示名に制御文字は使用できません。",
			});
		},
	);

	test("上限ちょうどのUnicodeコードポイント数を受け入れる", () => {
		// 機能要件：表示名は100 Unicodeコードポイントまで登録できる。
		// Given
		const displayName = "🍑".repeat(DISPLAY_NAME_MAX_LENGTH);

		// When
		const result = validateDisplayName(displayName);

		// Then
		expect(result).toEqual({ ok: true, value: displayName });
	});

	test("上限を1 Unicodeコードポイント超える表示名を拒否する", () => {
		// 機能要件：100 Unicodeコードポイントを超える表示名では登録できない。
		// Given
		const displayName = "🍑".repeat(DISPLAY_NAME_MAX_LENGTH + 1);

		// When
		const result = validateDisplayName(displayName);

		// Then
		expect(result).toEqual({
			ok: false,
			error: `表示名は${DISPLAY_NAME_MAX_LENGTH}文字以内で入力してください。`,
		});
	});
});
