import { describe, expect, test } from "bun:test";
import {
	getSaveStatusClassName,
	getSaveStatusMessage,
} from "@/features/tools/notepad/utils/saveStatus";

describe("notepad save status", () => {
	test.each([
		["saving", "保存中..."],
		["pending", "未保存の変更があります"],
		["error", "保存に失敗しました"],
	] as const)("%s状態に対応するメッセージを返す", (state, expected) => {
		// 機能要件：保存処理の各状態をユーザーが理解できる日本語で表示する。
		// Given
		const updatedAt = "2026-07-17T00:00:00.000Z";

		// When
		const message = getSaveStatusMessage(state, updatedAt);

		// Then
		expect(message).toBe(expected);
	});

	test("更新日時がない保存済み状態を簡潔に表示する", () => {
		// 機能要件：初期保存済み状態では日時を補わず保存済みと表示する。
		// Given / When
		const message = getSaveStatusMessage("saved", null);

		// Then
		expect(message).toBe("保存済み");
	});

	test.each([
		["saved", "text-ctp-subtext1"],
		["saving", "text-ctp-sapphire"],
		["pending", "text-ctp-yellow"],
		["error", "text-ctp-red"],
	] as const)("%s状態に対応する文字色を返す", (state, expected) => {
		// 機能要件：保存状態ごとに既定の意味色を適用する。
		// Given / When
		const className = getSaveStatusClassName(state);

		// Then
		expect(className).toBe(expected);
	});
});
