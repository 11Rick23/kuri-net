import { beforeEach, describe, expect, mock, test } from "bun:test";

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

const { getCurrentUserNotepad } = await import(
	"@/features/tools/notepad/server/notepad"
);

describe("getCurrentUserNotepad", () => {
	beforeEach(() => {
		getAuthenticatedSessionMock.mockClear();
		getNotepadByUserIDMock.mockClear();
		saveNotepadMock.mockClear();
	});

	test("外部から余分なユーザーIDを渡されてもセッションのユーザーIDを使う", async () => {
		getAuthenticatedSessionMock.mockResolvedValue({
			user: { id: "current-user" },
		});
		getNotepadByUserIDMock.mockResolvedValue({
			content: "自分のメモ",
			updatedAt: new Date("2026-07-17T00:00:00.000Z"),
		});

		const callWithUntrustedUserID = getCurrentUserNotepad as (
			userID: string,
		) => ReturnType<typeof getCurrentUserNotepad>;
		const result = await callWithUntrustedUserID("another-user");

		expect(getNotepadByUserIDMock).toHaveBeenCalledWith("current-user");
		expect(getNotepadByUserIDMock).not.toHaveBeenCalledWith("another-user");
		expect(result.content).toBe("自分のメモ");
	});

	test("認証済みセッションがなければメモを取得しない", async () => {
		getAuthenticatedSessionMock.mockResolvedValue(null);

		expect(getCurrentUserNotepad()).rejects.toThrow("Authentication required.");
		expect(getNotepadByUserIDMock).not.toHaveBeenCalled();
	});
});
