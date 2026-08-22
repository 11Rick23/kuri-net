import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createRegistration } from "@/features/auth/client/registrationCore";
import type { Result } from "@/shared/types/result";

type ActionResult = Result<undefined, string>;
type ClientResult = { data?: unknown; error?: unknown };

const signInAnonymousMock = mock(
	async (): Promise<ClientResult> => ({
		data: { user: { id: "temporary-user" } },
		error: null,
	}),
);
const addPasskeyMock = mock(
	async (): Promise<ClientResult> => ({
		data: { id: "passkey" },
		error: null,
	}),
);
const signOutMock = mock(
	async (): Promise<unknown> => ({
		data: { success: true },
		error: null,
	}),
);
const updateRegistrationDisplayNameMock = mock(
	async (): Promise<ActionResult> => ({
		ok: true,
		value: undefined,
	}),
);
const completePasskeyRegistrationMock = mock(
	async (): Promise<ActionResult> => ({
		ok: true,
		value: undefined,
	}),
);
const cleanupIncompleteRegistrationMock = mock(async (): Promise<void> => {});

const register = createRegistration({
	signInAnonymously: signInAnonymousMock,
	updateDisplayName: updateRegistrationDisplayNameMock,
	addPasskey: addPasskeyMock,
	completeRegistration: completePasskeyRegistrationMock,
	cleanupRegistration: cleanupIncompleteRegistrationMock,
	signOut: signOutMock,
});

describe("register", () => {
	beforeEach(() => {
		signInAnonymousMock.mockClear();
		addPasskeyMock.mockClear();
		signOutMock.mockClear();
		updateRegistrationDisplayNameMock.mockClear();
		completePasskeyRegistrationMock.mockClear();
		cleanupIncompleteRegistrationMock.mockClear();

		signInAnonymousMock.mockResolvedValue({
			data: { user: { id: "temporary-user" } },
			error: null,
		});
		addPasskeyMock.mockResolvedValue({
			data: { id: "passkey" },
			error: null,
		});
		signOutMock.mockResolvedValue({
			data: { success: true },
			error: null,
		});
		updateRegistrationDisplayNameMock.mockResolvedValue({
			ok: true,
			value: undefined,
		});
		completePasskeyRegistrationMock.mockResolvedValue({
			ok: true,
			value: undefined,
		});
		cleanupIncompleteRegistrationMock.mockResolvedValue();
	});

	test("表示名を整形して匿名セッションとパスキーの登録を完了する", async () => {
		// 機能要件：有効な表示名で一時セッション作成、表示名保存、パスキー追加、登録完了を実行する。
		// Given
		const displayName = "  くり 🍑  ";

		// When
		const result = await register(displayName);

		// Then
		expect(result).toEqual({ ok: true, value: "登録に成功しました。" });
		expect(signInAnonymousMock).toHaveBeenCalledTimes(1);
		expect(updateRegistrationDisplayNameMock).toHaveBeenCalledWith("くり 🍑");
		expect(addPasskeyMock).toHaveBeenCalledWith("くり 🍑");
		expect(completePasskeyRegistrationMock).toHaveBeenCalledTimes(1);
		expect(cleanupIncompleteRegistrationMock).not.toHaveBeenCalled();
		expect(signOutMock).not.toHaveBeenCalled();
	});

	test("無効な表示名では認証処理を開始しない", async () => {
		// 機能要件：空の表示名ではユーザー登録を開始できない。
		// 非機能要件：入力検証に失敗した場合は認証やDBの副作用を起こさない。
		// Given
		const displayName = "   ";

		// When
		const result = await register(displayName);

		// Then
		expect(result).toEqual({
			ok: false,
			error: "表示名を入力してください。",
		});
		expect(signInAnonymousMock).not.toHaveBeenCalled();
		expect(updateRegistrationDisplayNameMock).not.toHaveBeenCalled();
	});

	test("匿名セッションを作成できない場合は後処理を行わず失敗を返す", async () => {
		// 機能要件：登録用の匿名セッションを作成できない場合は登録開始エラーを返す。
		// 非機能要件：一時セッション未作成時は削除やsign-outを実行しない。
		// Given
		signInAnonymousMock.mockResolvedValue({
			data: null,
			error: { code: "FAILED" },
		});

		// When
		const result = await register("くり");

		// Then
		expect(result).toEqual({
			ok: false,
			error: "登録を開始できませんでした。",
		});
		expect(cleanupIncompleteRegistrationMock).not.toHaveBeenCalled();
		expect(signOutMock).not.toHaveBeenCalled();
	});

	test("パスキー操作のキャンセル時は一時登録を破棄して理由を返す", async () => {
		// 機能要件：パスキー登録をキャンセルした場合は一時登録を破棄してキャンセル結果を返す。
		// Given
		addPasskeyMock.mockResolvedValue({
			data: null,
			error: { code: "ERROR_CEREMONY_ABORTED" },
		});

		// When
		const result = await register("くり");

		// Then
		expect(result).toEqual({
			ok: false,
			error: "登録がキャンセルされました。",
		});
		expect(cleanupIncompleteRegistrationMock).toHaveBeenCalledTimes(1);
		expect(signOutMock).toHaveBeenCalledTimes(1);
		expect(completePasskeyRegistrationMock).not.toHaveBeenCalled();
	});

	test("登録完了処理の拒否時は一時登録を破棄して失敗を返す", async () => {
		// 機能要件：サーバーが登録完了を拒否した場合は一時登録を破棄して失敗を返す。
		// Given
		completePasskeyRegistrationMock.mockResolvedValue({
			ok: false,
			error: "登録状態が無効です。",
		});

		// When
		const result = await register("くり");

		// Then
		expect(result).toEqual({
			ok: false,
			error: "登録中にエラーが発生しました。",
		});
		expect(cleanupIncompleteRegistrationMock).toHaveBeenCalledTimes(1);
		expect(signOutMock).toHaveBeenCalledTimes(1);
	});

	test("cleanupとsign-outが両方失敗しても元の登録エラーをResultで返す", async () => {
		// 機能要件：登録後処理に失敗しても、呼び出し元には登録失敗のResultを返す。
		// 非機能要件：cleanup失敗時もsign-outを試行し、後処理例外を画面へ伝播させない。
		// Given
		updateRegistrationDisplayNameMock.mockResolvedValue({
			ok: false,
			error: "登録状態を更新できませんでした。",
		});
		cleanupIncompleteRegistrationMock.mockRejectedValue(
			new Error("cleanup failed"),
		);
		signOutMock.mockRejectedValue(new Error("sign-out failed"));

		// When
		const result = await register("くり");

		// Then
		expect(result).toEqual({
			ok: false,
			error: "登録中にエラーが発生しました。",
		});
		expect(cleanupIncompleteRegistrationMock).toHaveBeenCalledTimes(1);
		expect(signOutMock).toHaveBeenCalledTimes(1);
	});
});
