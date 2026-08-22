import { and, eq } from "drizzle-orm";
import type { db as applicationDatabase } from "@/database";
import { authPasskeys, authSessions, users } from "@/database/schema";
import {
	DEFAULT_DISPLAY_NAME,
	validateDisplayName,
} from "@/features/auth/shared/displayName";
import type { AuthenticatedUserState } from "@/features/auth/shared/policy";
import { InvalidInputError } from "@/shared/errors/base";
import { DatabaseError } from "@/shared/errors/database";

export type RegistrationCompletionResult =
	| { status: "completed" }
	| { status: "invalid-user-state" }
	| { status: "invalid-display-name"; error: string }
	| { status: "missing-passkey" };

export type PasskeyAuthenticationSyncResult =
	| "not-found"
	| "unchanged"
	| "legacy-profile-completed"
	| "registration-completed";

type PasskeyOwner = AuthenticatedUserState & {
	id: string;
	name: string;
};

function requireIdentifier(value: string, label: string): void {
	if (value.trim().length === 0) {
		throw new InvalidInputError(`${label}が無効です。`);
	}
}

function databaseError(message: string, cause: unknown): DatabaseError {
	if (cause instanceof DatabaseError) {
		return cause;
	}

	return new DatabaseError(message, { cause });
}

export function createAuthRepository(database: typeof applicationDatabase) {
	async function getAuthUserStateByID(
		userID: string,
	): Promise<AuthenticatedUserState | undefined> {
		requireIdentifier(userID, "ユーザーID");

		try {
			const [user] = await database
				.select({
					status: users.status,
					isAnonymous: users.isAnonymous,
					profileCompleted: users.profileCompleted,
				})
				.from(users)
				.where(eq(users.id, userID))
				.limit(1);

			return user;
		} catch (error) {
			throw databaseError("認証ユーザーの取得に失敗しました。", error);
		}
	}

	async function updateRegisteringDisplayName(
		userID: string,
		displayName: string,
	): Promise<boolean> {
		requireIdentifier(userID, "ユーザーID");

		try {
			const updated = await database
				.update(users)
				.set({ name: displayName, updatedAt: new Date() })
				.where(
					and(
						eq(users.id, userID),
						eq(users.status, "REGISTERING"),
						eq(users.isAnonymous, true),
					),
				)
				.returning({ id: users.id });

			return updated.length === 1;
		} catch (error) {
			throw databaseError("登録中ユーザーの表示名更新に失敗しました。", error);
		}
	}

	async function completeRegisteringUser(
		userID: string,
	): Promise<RegistrationCompletionResult> {
		requireIdentifier(userID, "ユーザーID");

		try {
			return await database.transaction(async (tx) => {
				const [user] = await tx
					.select({
						id: users.id,
						name: users.name,
						status: users.status,
						isAnonymous: users.isAnonymous,
					})
					.from(users)
					.where(eq(users.id, userID))
					.for("update")
					.limit(1);

				if (user?.status !== "REGISTERING" || !user.isAnonymous) {
					return { status: "invalid-user-state" };
				}

				const displayName = validateDisplayName(user.name);
				if (!displayName.ok) {
					return { status: "invalid-display-name", error: displayName.error };
				}

				const [ownedPasskey] = await tx
					.select({ id: authPasskeys.id })
					.from(authPasskeys)
					.where(eq(authPasskeys.userId, user.id))
					.limit(1);

				if (!ownedPasskey) {
					return { status: "missing-passkey" };
				}

				await tx
					.update(authPasskeys)
					.set({ name: displayName.value })
					.where(eq(authPasskeys.id, ownedPasskey.id))
					.execute();

				await tx
					.update(users)
					.set({
						name: displayName.value,
						status: "ACTIVE",
						isAnonymous: false,
						profileCompleted: true,
						updatedAt: new Date(),
					})
					.where(eq(users.id, user.id))
					.execute();

				return { status: "completed" };
			});
		} catch (error) {
			throw databaseError("パスキー登録の完了処理に失敗しました。", error);
		}
	}

	async function cleanupRegisteringUser(userID: string): Promise<boolean> {
		requireIdentifier(userID, "ユーザーID");

		try {
			return await database.transaction(async (tx) => {
				const [user] = await tx
					.select({ id: users.id })
					.from(users)
					.where(
						and(
							eq(users.id, userID),
							eq(users.status, "REGISTERING"),
							eq(users.isAnonymous, true),
						),
					)
					.for("update")
					.limit(1);

				if (!user) {
					return false;
				}

				const [passkey] = await tx
					.select({ id: authPasskeys.id })
					.from(authPasskeys)
					.where(eq(authPasskeys.userId, user.id))
					.limit(1);

				if (passkey) {
					return false;
				}

				await tx
					.delete(authSessions)
					.where(eq(authSessions.userId, user.id))
					.execute();
				await tx.delete(users).where(eq(users.id, user.id)).execute();
				return true;
			});
		} catch (error) {
			throw databaseError("未完了の登録データ削除に失敗しました。", error);
		}
	}

	async function getPasskeyOwnerByCredentialID(
		credentialID: string,
	): Promise<PasskeyOwner | undefined> {
		requireIdentifier(credentialID, "クレデンシャルID");

		const [owner] = await database
			.select({
				id: users.id,
				name: users.name,
				status: users.status,
				isAnonymous: users.isAnonymous,
				profileCompleted: users.profileCompleted,
			})
			.from(authPasskeys)
			.innerJoin(users, eq(users.id, authPasskeys.userId))
			.where(eq(authPasskeys.credentialID, credentialID))
			.limit(1);

		return owner;
	}

	async function synchronizePasskeyOwnerAfterAuthentication(
		credentialID: string,
	): Promise<PasskeyAuthenticationSyncResult> {
		try {
			const owner = await getPasskeyOwnerByCredentialID(credentialID);
			if (!owner) {
				return "not-found";
			}

			if (
				owner.status === "ACTIVE" &&
				!owner.isAnonymous &&
				!owner.profileCompleted
			) {
				await database
					.update(users)
					.set({
						name: DEFAULT_DISPLAY_NAME,
						profileCompleted: true,
						updatedAt: new Date(),
					})
					.where(
						and(
							eq(users.id, owner.id),
							eq(users.status, "ACTIVE"),
							eq(users.isAnonymous, false),
							eq(users.profileCompleted, false),
						),
					)
					.execute();
				return "legacy-profile-completed";
			}

			if (owner.status !== "REGISTERING" || !owner.isAnonymous) {
				return "unchanged";
			}

			const displayName = validateDisplayName(owner.name);
			if (!displayName.ok) {
				return "unchanged";
			}

			await database
				.update(users)
				.set({
					name: displayName.value,
					status: "ACTIVE",
					isAnonymous: false,
					profileCompleted: true,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(users.id, owner.id),
						eq(users.status, "REGISTERING"),
						eq(users.isAnonymous, true),
					),
				)
				.execute();

			return "registration-completed";
		} catch (error) {
			if (error instanceof InvalidInputError) {
				throw error;
			}

			throw databaseError("パスキー所有者の状態更新に失敗しました。", error);
		}
	}

	return {
		getAuthUserStateByID,
		updateRegisteringDisplayName,
		completeRegisteringUser,
		cleanupRegisteringUser,
		synchronizePasskeyOwnerAfterAuthentication,
	};
}
