import { describe, expect, test } from "bun:test";
import {
	DISPLAY_NAME_MAX_LENGTH,
	validateDisplayName,
} from "@/features/auth/shared/displayName";

describe("validateDisplayName", () => {
	test.each(["くりくり", "kuri 🍑", "同じ名前", "同じ名前"])(
		"日本語・絵文字・空白・重複を許可する: %s",
		(value) => {
			expect(validateDisplayName(value)).toEqual({ ok: true, value });
		},
	);

	test("前後の空白を除去する", () => {
		expect(validateDisplayName("  表示 名  ")).toEqual({
			ok: true,
			value: "表示 名",
		});
	});

	test.each(["", "   ", "名前\u0000", "名前\n"])(
		"空文字・空白のみ・制御文字を拒否する: %j",
		(value) => {
			expect(validateDisplayName(value).ok).toBe(false);
		},
	);

	test("100 Unicodeコードポイントを許可し、101を拒否する", () => {
		expect(validateDisplayName("🍑".repeat(DISPLAY_NAME_MAX_LENGTH)).ok).toBe(
			true,
		);
		expect(
			validateDisplayName("🍑".repeat(DISPLAY_NAME_MAX_LENGTH + 1)).ok,
		).toBe(false);
	});
});
