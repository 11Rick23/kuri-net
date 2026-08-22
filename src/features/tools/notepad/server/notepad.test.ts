import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
	NOTEPAD_CONTENT_MAX_CODE_POINTS,
	NOTEPAD_CONTENT_TOO_LONG_ERROR,
} from "@/features/tools/notepad/domain/content";

const getAuthenticatedSessionMock = mock(async (): Promise<unknown> => null);
const getNotepadByUserIDMock = mock(async (): Promise<unknown> => null);
const saveNotepadMock = mock(async (): Promise<unknown> => null);

mock.module("@/features/auth/server/session", () => ({
	getAuthenticatedSession: getAuthenticatedSessionMock,
}));

mock.module("@/features/tools/notepad/data/repository", () => ({
	getNotepadByUserID: getNotepadByUserIDMock,
	saveNotepad: saveNotepadMock,
}));

const { getCurrentUserNotepad, saveCurrentUserNotepad } = await import(
	"@/features/tools/notepad/server/notepad"
);

describe("notepad server actions", () => {
	beforeEach(() => {
		getAuthenticatedSessionMock.mockReset();
		getNotepadByUserIDMock.mockReset();
		saveNotepadMock.mockReset();
	});

	test("認証中のユーザーが保存済みメモを取得する", async () => {
		// 機能要件：認証済みユーザーには、自分の保存済みメモと更新日時を返す。
		// Given
		getAuthenticatedSessionMock.mockResolvedValue({
			user: { id: "current-user" },
		});
		getNotepadByUserIDMock.mockResolvedValue({
			content: "自分のメモ",
			updatedAt: new Date("2026-07-17T00:00:00.000Z"),
		});

		// When
		const result = await getCurrentUserNotepad();

		// Then
		expect(result).toEqual({
			content: "自分のメモ",
			updatedAt: "2026-07-17T00:00:00.000Z",
		});
		expect(getNotepadByUserIDMock).toHaveBeenCalledWith("current-user");
	});

	test("保存済みメモがない場合は空の初期状態を返す", async () => {
		// 機能要件：初めてメモを開く認証済みユーザーには、空の本文と更新日時なしを返す。
		// Given
		getAuthenticatedSessionMock.mockResolvedValue({
			user: { id: "new-user" },
		});
		getNotepadByUserIDMock.mockResolvedValue(null);

		// When
		const result = await getCurrentUserNotepad();

		// Then
		expect(result).toEqual({ content: "", updatedAt: null });
		expect(getNotepadByUserIDMock).toHaveBeenCalledWith("new-user");
	});

	test("未認証の場合はメモを取得しない", async () => {
		// 機能要件：未認証ユーザーのメモ取得を拒否する。
		// 非機能要件：認証拒否時はrepositoryへアクセスしない。
		// Given
		getAuthenticatedSessionMock.mockResolvedValue(null);

		// When / Then
		expect(getCurrentUserNotepad()).rejects.toThrow("Authentication required.");
		expect(getNotepadByUserIDMock).not.toHaveBeenCalled();
	});

	test("認証中のユーザーが自分のメモを保存する", async () => {
		// 機能要件：認証済みユーザーのメモ本文を保存し、更新日時を返す。
		// Given
		getAuthenticatedSessionMock.mockResolvedValue({
			user: { id: "current-user" },
		});
		saveNotepadMock.mockResolvedValue({
			updatedAt: new Date("2026-07-18T01:02:03.000Z"),
		});

		// When
		const result = await saveCurrentUserNotepad("更新したメモ");

		// Then
		expect(result).toEqual({
			ok: true,
			updatedAt: "2026-07-18T01:02:03.000Z",
		});
		expect(saveNotepadMock).toHaveBeenCalledWith(
			"current-user",
			"更新したメモ",
		);
	});

	test("上限ちょうどの本文を保存する", async () => {
		// 機能要件：20万Unicodeコードポイントちょうどのメモ本文を保存できる。
		// Given
		const content = "🍑".repeat(NOTEPAD_CONTENT_MAX_CODE_POINTS);
		getAuthenticatedSessionMock.mockResolvedValue({
			user: { id: "current-user" },
		});
		saveNotepadMock.mockResolvedValue({
			updatedAt: new Date("2026-07-18T01:02:03.000Z"),
		});

		// When
		await saveCurrentUserNotepad(content);

		// Then
		expect(saveNotepadMock).toHaveBeenCalledWith("current-user", content);
	});

	test("上限を超えた本文は認証・保存処理の前に拒否する", async () => {
		// 機能要件：20万Unicodeコードポイントを超えたメモ本文を日本語エラーで拒否する。
		// 非機能要件：不正な本文では認証確認とDB保存の副作用を発生させない。
		// Given
		const content = "🍑".repeat(NOTEPAD_CONTENT_MAX_CODE_POINTS + 1);

		// When / Then
		expect(saveCurrentUserNotepad(content)).rejects.toThrow(
			NOTEPAD_CONTENT_TOO_LONG_ERROR,
		);
		expect(getAuthenticatedSessionMock).not.toHaveBeenCalled();
		expect(saveNotepadMock).not.toHaveBeenCalled();
	});

	test("文字列以外の本文は認証・保存処理の前に拒否する", async () => {
		// 機能要件：Server Actionへ渡された文字列以外の本文を拒否する。
		// 非機能要件：TypeScriptの型を迂回した入力でもDB保存を実行しない。
		// Given
		const content: unknown = { content: "不正なメモ" };

		// When / Then
		expect(saveCurrentUserNotepad(content)).rejects.toThrow(
			"指定されたメモ内容が無効です。",
		);
		expect(getAuthenticatedSessionMock).not.toHaveBeenCalled();
		expect(saveNotepadMock).not.toHaveBeenCalled();
	});

	test("未認証の場合はメモを保存しない", async () => {
		// 機能要件：未認証ユーザーのメモ保存を拒否する。
		// 非機能要件：認証拒否時はDB保存を実行しない。
		// Given
		getAuthenticatedSessionMock.mockResolvedValue(null);

		// When / Then
		expect(saveCurrentUserNotepad("保存しないメモ")).rejects.toThrow(
			"Authentication required.",
		);
		expect(saveNotepadMock).not.toHaveBeenCalled();
	});

	test("repositoryの保存エラーを成功として扱わない", async () => {
		// 機能要件：メモの永続化に失敗した場合は保存成功を返さない。
		// Given
		getAuthenticatedSessionMock.mockResolvedValue({
			user: { id: "current-user" },
		});
		saveNotepadMock.mockRejectedValue(new Error("database unavailable"));

		// When / Then
		expect(saveCurrentUserNotepad("未保存のメモ")).rejects.toThrow(
			"database unavailable",
		);
	});
});
