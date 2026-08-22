import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createLogin } from "@/features/auth/client/loginCore";

type ClientResult = { data?: unknown; error?: unknown };

const signInPasskeyMock = mock(
	async (): Promise<ClientResult> => ({
		data: { user: { id: "current-user" } },
		error: null,
	}),
);
const signOutMock = mock(
	async (): Promise<unknown> => ({
		data: { success: true },
		error: null,
	}),
);
const getPostLoginPathMock = mock(async (): Promise<"/" | null> => "/");

const login = createLogin({
	signInWithPasskey: signInPasskeyMock,
	getPostLoginPath: getPostLoginPathMock,
	signOut: signOutMock,
});

describe("login", () => {
	beforeEach(() => {
		signInPasskeyMock.mockClear();
		signOutMock.mockClear();
		getPostLoginPathMock.mockClear();
		signInPasskeyMock.mockResolvedValue({
			data: { user: { id: "current-user" } },
			error: null,
		});
		signOutMock.mockResolvedValue({
			data: { success: true },
			error: null,
		});
		getPostLoginPathMock.mockResolvedValue("/");
	});

	test("パスキー認証後に許可されたページを返す", async () => {
		// 機能要件：有効なパスキーとユーザー状態でログインした場合はトップページへ遷移できる。
		// Given
		getPostLoginPathMock.mockResolvedValue("/");

		// When
		const result = await login();

		// Then
		expect(result).toEqual({ ok: true, value: "/" });
		expect(signOutMock).not.toHaveBeenCalled();
	});

	test("パスキー認証のキャンセル理由を返す", async () => {
		// 機能要件：パスキー認証をキャンセルした場合はキャンセル結果を返す。
		// Given
		signInPasskeyMock.mockResolvedValue({
			data: null,
			error: { code: "AUTH_CANCELLED" },
		});

		// When
		const result = await login();

		// Then
		expect(result).toEqual({
			ok: false,
			error: "認証がキャンセルされました。",
		});
		expect(getPostLoginPathMock).not.toHaveBeenCalled();
	});

	test("認証後のユーザー状態が無効ならsign-outして利用を拒否する", async () => {
		// 機能要件：パスキー認証後も利用条件を満たさないアカウントはログインさせない。
		// Given
		getPostLoginPathMock.mockResolvedValue(null);

		// When
		const result = await login();

		// Then
		expect(result).toEqual({
			ok: false,
			error: "このアカウントは利用できません。",
		});
		expect(signOutMock).toHaveBeenCalledTimes(1);
	});

	test("拒否後のsign-outが失敗しても利用不可のResultを返す", async () => {
		// 機能要件：利用不可アカウントのsign-outに失敗してもログイン失敗をResultで返す。
		// 非機能要件：後処理例外を画面へ伝播させない。
		// Given
		getPostLoginPathMock.mockResolvedValue(null);
		signOutMock.mockRejectedValue(new Error("sign-out failed"));

		// When
		const result = await login();

		// Then
		expect(result).toEqual({
			ok: false,
			error: "このアカウントは利用できません。",
		});
	});

	test("認証境界で例外が発生しても汎用エラーをResultで返す", async () => {
		// 機能要件：認証処理で予期しない失敗が起きた場合は利用者向けの認証エラーを返す。
		// 非機能要件：内部例外を画面へ伝播させず、作成済みセッションの破棄を試行する。
		// Given
		getPostLoginPathMock.mockRejectedValue(new Error("database failed"));

		// When
		const result = await login();

		// Then
		expect(result).toEqual({
			ok: false,
			error: "パスキーで認証できませんでした。",
		});
		expect(signOutMock).toHaveBeenCalledTimes(1);
	});
});
