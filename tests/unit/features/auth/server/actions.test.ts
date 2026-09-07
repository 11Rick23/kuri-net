import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { RegistrationCompletionResult } from "@/features/auth/data/repositoryCore";
import {
	createAuthActions,
	type RawAuthSession,
} from "@/features/auth/server/actionCore";
import type { AuthenticatedUserState } from "@/features/auth/shared/policy";

const revalidatePathMock = mock((_path: string): void => {});
const getRawSessionMock = mock(
	async (): Promise<RawAuthSession | null> => null,
);
const getAuthUserStateByIDMock = mock(
	async (): Promise<AuthenticatedUserState | undefined> => undefined,
);
const updateRegisteringDisplayNameMock = mock(
	async (): Promise<boolean> => false,
);
const completeRegisteringUserMock = mock(
	async (): Promise<RegistrationCompletionResult> => ({
		status: "invalid-user-state",
	}),
);
const cleanupRegisteringUserMock = mock(async (): Promise<boolean> => false);

const {
	cleanupIncompleteRegistration,
	completePasskeyRegistration,
	getPostLoginPath,
	updateRegistrationDisplayName,
} = createAuthActions({
	getRawSession: getRawSessionMock,
	getAuthUserStateByID: getAuthUserStateByIDMock,
	updateRegisteringDisplayName: updateRegisteringDisplayNameMock,
	completeRegisteringUser: completeRegisteringUserMock,
	cleanupRegisteringUser: cleanupRegisteringUserMock,
	revalidatePath: revalidatePathMock,
});

const rawSession = { user: { id: "current-user" } };

describe("auth server actions", () => {
	beforeEach(() => {
		revalidatePathMock.mockClear();
		getRawSessionMock.mockClear();
		getAuthUserStateByIDMock.mockClear();
		updateRegisteringDisplayNameMock.mockClear();
		completeRegisteringUserMock.mockClear();
		cleanupRegisteringUserMock.mockClear();
		getRawSessionMock.mockResolvedValue(null);
		getAuthUserStateByIDMock.mockResolvedValue(undefined);
		updateRegisteringDisplayNameMock.mockResolvedValue(false);
		completeRegisteringUserMock.mockResolvedValue({
			status: "invalid-user-state",
		});
		cleanupRegisteringUserMock.mockResolvedValue(false);
	});

	test("認証済みユーザーにはログイン後のトップページを返す", async () => {
		// 機能要件：有効なセッションとユーザー状態がそろった場合はトップページへ遷移できる。
		// Given
		getRawSessionMock.mockResolvedValue(rawSession);
		getAuthUserStateByIDMock.mockResolvedValue({
			status: "ACTIVE",
			isAnonymous: false,
			profileCompleted: true,
		});

		// When
		const path = await getPostLoginPath();

		// Then
		expect(path).toBe("/");
		expect(getAuthUserStateByIDMock).toHaveBeenCalledWith("current-user");
	});

	test("セッションがなければユーザー状態を取得せずログインを拒否する", async () => {
		// 機能要件：セッションがない利用者にはログイン後の遷移先を返さない。
		// 非機能要件：認証前にユーザーのDB情報を問い合わせない。
		// Given
		getRawSessionMock.mockResolvedValue(null);

		// When
		const path = await getPostLoginPath();

		// Then
		expect(path).toBeNull();
		expect(getAuthUserStateByIDMock).not.toHaveBeenCalled();
	});

	test("無効な表示名ではセッション確認やDB更新を行わない", async () => {
		// 機能要件：空の表示名では登録情報を更新できない。
		// 非機能要件：入力検証に失敗した場合は認証確認とDB更新を行わない。
		// Given
		const displayName = "   ";

		// When
		const result = await updateRegistrationDisplayName(displayName);

		// Then
		expect(result).toEqual({
			ok: false,
			error: "表示名を入力してください。",
		});
		expect(getRawSessionMock).not.toHaveBeenCalled();
		expect(updateRegisteringDisplayNameMock).not.toHaveBeenCalled();
	});

	test("登録セッションがなければ表示名を更新しない", async () => {
		// 機能要件：有効な表示名でも登録セッションがなければ登録情報を更新できない。
		// 非機能要件：未認証状態ではDB更新を行わない。
		// Given
		getRawSessionMock.mockResolvedValue(null);

		// When
		const result = await updateRegistrationDisplayName("くり");

		// Then
		expect(result).toEqual({
			ok: false,
			error: "登録セッションを確認できませんでした。",
		});
		expect(updateRegisteringDisplayNameMock).not.toHaveBeenCalled();
	});

	test("登録中セッションの表示名を整形して更新する", async () => {
		// 機能要件：登録中の表示名は前後の空白を除去して保存する。
		// Given
		getRawSessionMock.mockResolvedValue(rawSession);
		updateRegisteringDisplayNameMock.mockResolvedValue(true);

		// When
		const result = await updateRegistrationDisplayName("  くり  ");

		// Then
		expect(result).toEqual({ ok: true, value: undefined });
		expect(updateRegisteringDisplayNameMock).toHaveBeenCalledWith(
			"current-user",
			"くり",
		);
	});

	test("登録状態に一致するユーザーがなければ表示名更新を拒否する", async () => {
		// 機能要件：登録中の匿名ユーザーとして更新できなかった場合は登録を続行しない。
		// Given
		getRawSessionMock.mockResolvedValue(rawSession);
		updateRegisteringDisplayNameMock.mockResolvedValue(false);

		// When
		const result = await updateRegistrationDisplayName("くり");

		// Then
		expect(result).toEqual({
			ok: false,
			error: "登録状態を更新できませんでした。",
		});
	});

	test("登録セッションがなければパスキー登録を完了しない", async () => {
		// 機能要件：登録セッションがない状態ではパスキー登録を完了できない。
		// 非機能要件：未認証状態ではユーザー状態のDB更新と画面再検証を行わない。
		// Given
		getRawSessionMock.mockResolvedValue(null);

		// When
		const result = await completePasskeyRegistration();

		// Then
		expect(result).toEqual({
			ok: false,
			error: "登録セッションを確認できませんでした。",
		});
		expect(completeRegisteringUserMock).not.toHaveBeenCalled();
		expect(revalidatePathMock).not.toHaveBeenCalled();
	});

	test.each([
		{
			completion: { status: "invalid-user-state" },
			error: "登録状態が無効です。",
		},
		{
			completion: { status: "invalid-display-name", error: "表示名エラー" },
			error: "表示名エラー",
		},
		{
			completion: { status: "missing-passkey" },
			error: "登録済みのパスキーを確認できません。",
		},
	])("登録完了条件を満たさない場合は理由を返す: $error", async (entry) => {
		// 機能要件：登録完了に必要なユーザー状態、表示名、パスキーが不足する場合は理由を返す。
		// 非機能要件：登録が完了していない状態で画面キャッシュを更新しない。
		// Given
		getRawSessionMock.mockResolvedValue(rawSession);
		completeRegisteringUserMock.mockResolvedValue(entry.completion);

		// When
		const result = await completePasskeyRegistration();

		// Then
		expect(result).toEqual({ ok: false, error: entry.error });
		expect(revalidatePathMock).not.toHaveBeenCalled();
	});

	test("パスキー登録完了後にトップページを再検証する", async () => {
		// 機能要件：登録完了後は認証済み表示へ切り替えられるようトップページを再検証する。
		// Given
		getRawSessionMock.mockResolvedValue(rawSession);
		completeRegisteringUserMock.mockResolvedValue({ status: "completed" });

		// When
		const result = await completePasskeyRegistration();

		// Then
		expect(result).toEqual({ ok: true, value: undefined });
		expect(completeRegisteringUserMock).toHaveBeenCalledWith("current-user");
		expect(revalidatePathMock).toHaveBeenCalledWith("/");
	});

	test("セッションのユーザーIDで未完了登録を削除する", async () => {
		// 機能要件：登録中断時は現在のセッションに属する未完了登録だけを削除する。
		// Given
		getRawSessionMock.mockResolvedValue(rawSession);

		// When
		await cleanupIncompleteRegistration();

		// Then
		expect(cleanupRegisteringUserMock).toHaveBeenCalledWith("current-user");
	});

	test("セッションがなければ未完了登録の削除を行わない", async () => {
		// 機能要件：登録セッションが存在しない場合は削除処理を終了する。
		// 非機能要件：認証できない状態ではDB削除を行わない。
		// Given
		getRawSessionMock.mockResolvedValue(null);

		// When
		await cleanupIncompleteRegistration();

		// Then
		expect(cleanupRegisteringUserMock).not.toHaveBeenCalled();
	});
});
