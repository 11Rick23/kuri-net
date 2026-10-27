import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { db as applicationDatabase } from "@/database";
import { createAuthRepository } from "@/features/auth/data/repositoryCore";

let selectResults: unknown[][] = [];
let returningResults: unknown[][] = [];

class SelectBuilder {
	from = mock((_table: unknown) => this);
	innerJoin = mock((_table: unknown, _condition: unknown) => this);
	where = mock((_condition: unknown) => this);
	for = mock((_mode: string) => this);
	limit = mock(async (_limit: number): Promise<unknown[]> => {
		return selectResults.shift() ?? [];
	});
}

class UpdateBuilder {
	set = mock((_values: unknown) => this);
	where = mock((_condition: unknown) => this);
	returning = mock(async (_fields: unknown): Promise<unknown[]> => {
		return returningResults.shift() ?? [];
	});
	execute = mock(async (): Promise<void> => {});
}

class DeleteBuilder {
	where = mock((_condition: unknown) => this);
	execute = mock(async (): Promise<void> => {});
}

const selectBuilders: SelectBuilder[] = [];
const updateBuilders: UpdateBuilder[] = [];
const deleteBuilders: DeleteBuilder[] = [];

const selectMock = mock((_fields?: unknown) => {
	const builder = new SelectBuilder();
	selectBuilders.push(builder);
	return builder;
});
const updateMock = mock((_table: unknown) => {
	const builder = new UpdateBuilder();
	updateBuilders.push(builder);
	return builder;
});
const deleteMock = mock((_table: unknown) => {
	const builder = new DeleteBuilder();
	deleteBuilders.push(builder);
	return builder;
});

type TransactionDatabase = {
	select: typeof selectMock;
	update: typeof updateMock;
	delete: typeof deleteMock;
};

const transactionDatabase: TransactionDatabase = {
	select: selectMock,
	update: updateMock,
	delete: deleteMock,
};
const transactionMock = mock(
	async (
		callback: (transaction: TransactionDatabase) => Promise<unknown>,
	): Promise<unknown> => callback(transactionDatabase),
);

const {
	cleanupRegisteringUser,
	completeRegisteringUser,
	getAuthUserStateByID,
	synchronizePasskeyOwnerAfterAuthentication,
	updateRegisteringDisplayName,
} = createAuthRepository({
	...transactionDatabase,
	transaction: transactionMock,
} as unknown as typeof applicationDatabase);

describe("auth data repository", () => {
	beforeEach(() => {
		selectResults = [];
		returningResults = [];
		selectBuilders.length = 0;
		updateBuilders.length = 0;
		deleteBuilders.length = 0;
		selectMock.mockClear();
		updateMock.mockClear();
		deleteMock.mockClear();
		transactionMock.mockClear();
	});

	test("ユーザーIDに対応する認証状態を返す", async () => {
		// 機能要件：セッションのユーザーIDから認証判定に必要な状態を取得する。
		// Given
		const state = {
			status: "ACTIVE" as const,
			isAnonymous: false,
			profileCompleted: true,
		};
		selectResults.push([state]);

		// When
		const result = await getAuthUserStateByID("current-user");

		// Then
		expect(result).toEqual(state);
		expect(selectMock).toHaveBeenCalledTimes(1);
	});

	test("空のユーザーIDではDBを照会しない", async () => {
		// 機能要件：有効なユーザーIDがない状態では認証情報を取得しない。
		// 非機能要件：不正な識別子でDBクエリを実行しない。
		// Given
		const userID = "   ";

		// When / Then
		expect(getAuthUserStateByID(userID)).rejects.toThrow(
			"ユーザーIDが無効です。",
		);
		expect(selectMock).not.toHaveBeenCalled();
	});

	test("登録中の匿名ユーザーだけ表示名の更新成功を返す", async () => {
		// 機能要件：登録中の匿名ユーザーを1件更新できた場合だけ表示名更新を成功とする。
		// Given
		returningResults.push([{ id: "current-user" }], []);

		// When
		const updated = await updateRegisteringDisplayName("current-user", "くり");
		const missing = await updateRegisteringDisplayName("missing-user", "くり");

		// Then
		expect(updated).toBe(true);
		expect(missing).toBe(false);
	});

	test("登録中ユーザーとパスキーを同じトランザクションで有効化する", async () => {
		// 機能要件：登録完了時はパスキー名とユーザー状態を同じトランザクションで確定する。
		// Given
		selectResults.push(
			[
				{
					id: "current-user",
					name: "  くり  ",
					status: "REGISTERING",
					isAnonymous: true,
				},
			],
			[{ id: "passkey" }],
		);

		// When
		const result = await completeRegisteringUser("current-user");

		// Then
		expect(result).toEqual({ status: "completed" });
		expect(transactionMock).toHaveBeenCalledTimes(1);
		expect(updateMock).toHaveBeenCalledTimes(2);
		expect(updateBuilders[0]?.set).toHaveBeenCalledWith({ name: "くり" });
		expect(updateBuilders[1]?.set).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "くり",
				status: "ACTIVE",
				isAnonymous: false,
				profileCompleted: true,
			}),
		);
	});

	test("登録状態が無効ならパスキーを照会せず更新しない", async () => {
		// 機能要件：登録中の匿名ユーザーでない場合は登録完了を拒否する。
		// 非機能要件：状態確認に失敗した場合はパスキーやユーザーを更新しない。
		// Given
		selectResults.push([
			{
				id: "current-user",
				name: "くり",
				status: "ACTIVE",
				isAnonymous: false,
			},
		]);

		// When
		const result = await completeRegisteringUser("current-user");

		// Then
		expect(result).toEqual({ status: "invalid-user-state" });
		expect(selectMock).toHaveBeenCalledTimes(1);
		expect(updateMock).not.toHaveBeenCalled();
	});

	test("パスキーがない登録途中ユーザーを有効化しない", async () => {
		// 機能要件：所有するパスキーが確認できない場合は登録を完了しない。
		// 非機能要件：必要な認証情報がない状態ではユーザー状態を更新しない。
		// Given
		selectResults.push(
			[
				{
					id: "current-user",
					name: "くり",
					status: "REGISTERING",
					isAnonymous: true,
				},
			],
			[],
		);

		// When
		const result = await completeRegisteringUser("current-user");

		// Then
		expect(result).toEqual({ status: "missing-passkey" });
		expect(updateMock).not.toHaveBeenCalled();
	});

	test("パスキーがない未完了登録だけをセッションとともに削除する", async () => {
		// 機能要件：登録中断時はパスキー未作成の一時ユーザーとセッションを削除する。
		// 非機能要件：削除条件の確認と削除を同じトランザクションで行う。
		// Given
		selectResults.push([{ id: "current-user" }], []);

		// When
		const deleted = await cleanupRegisteringUser("current-user");

		// Then
		expect(deleted).toBe(true);
		expect(transactionMock).toHaveBeenCalledTimes(1);
		expect(deleteMock).toHaveBeenCalledTimes(2);
	});

	test("パスキー作成済みの登録データを削除しない", async () => {
		// 機能要件：パスキーが作成済みの登録は中断cleanupの対象にしない。
		// 非機能要件：認証情報を持つユーザーを途中失敗として削除しない。
		// Given
		selectResults.push([{ id: "current-user" }], [{ id: "passkey" }]);

		// When
		const deleted = await cleanupRegisteringUser("current-user");

		// Then
		expect(deleted).toBe(false);
		expect(deleteMock).not.toHaveBeenCalled();
	});

	test("プロフィール未設定の既存ユーザーを既定表示名で補完する", async () => {
		// 機能要件：既存の有効ユーザーがプロフィール未設定なら認証後に既定表示名を設定する。
		// Given
		selectResults.push([
			{
				id: "legacy-user",
				name: "legacy-user",
				status: "ACTIVE",
				isAnonymous: false,
				profileCompleted: false,
			},
		]);

		// When
		const result =
			await synchronizePasskeyOwnerAfterAuthentication("credential-id");

		// Then
		expect(result).toBe("legacy-profile-completed");
		expect(updateBuilders[0]?.set).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "名無し",
				profileCompleted: true,
			}),
		);
	});

	test("登録中のパスキー所有者を認証後に有効化する", async () => {
		// 機能要件：登録完了直前のユーザーはパスキー認証後に有効な通常ユーザーへ移行する。
		// Given
		selectResults.push([
			{
				id: "registering-user",
				name: "  くり  ",
				status: "REGISTERING",
				isAnonymous: true,
				profileCompleted: false,
			},
		]);

		// When
		const result =
			await synchronizePasskeyOwnerAfterAuthentication("credential-id");

		// Then
		expect(result).toBe("registration-completed");
		expect(updateBuilders[0]?.set).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "くり",
				status: "ACTIVE",
				isAnonymous: false,
				profileCompleted: true,
			}),
		);
	});
});
