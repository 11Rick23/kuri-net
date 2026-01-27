import type { WebAuthnCredential } from "@simplewebauthn/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/database";
import {
	credentials,
	sessions,
	users,
	webAuthnChallenges,
} from "@/database/schema";
import { ExpiredChallengeError } from "@/errors/auth";
import { InvalidInputError } from "@/errors/base";
import { DatabaseError, QueryNotFoundError } from "@/errors/database";

export async function createUser(userID: string) {
	try {
		await db.insert(users).values({
			id: userID,
			status: "REGISTERING",
		});

		return await getUser(userID);
	} catch (error) {
		throw new DatabaseError(
			"ユーザーの作成中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function getUser(userID: string) {
	if (!userID || userID.trim() === "") {
		throw new InvalidInputError("指定されたユーザーIDが無効です。");
	}

	try {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, userID))
			.limit(1)
			.then((res) => res[0]);

		if (!user) {
			throw new QueryNotFoundError("ユーザーが見つかりませんでした。");
		}

		return user;
	} catch (error) {
		if (error instanceof QueryNotFoundError) {
			throw error;
		}
		throw new DatabaseError(
			"ユーザーの取得中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function updateUserStatus(
	userID: string,
	status: "REGISTERING" | "ACTIVE" | "SUSPENDED",
) {
	if (!userID || userID.trim() === "") {
		throw new InvalidInputError("指定されたユーザーIDが無効です。");
	}

	try {
		await db
			.update(users)
			.set({ status: status, updatedAt: new Date() })
			.where(eq(users.id, userID));
	} catch (error) {
		throw new DatabaseError(
			"ユーザーステータスの更新中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function createSession(
	userID: string | null = null,
	expiresAt: number = 1000 * 60 * 60 * 24 * 30, // デフォルトで30日間有効
) {
	const expiresAtDate = new Date(Date.now() + expiresAt);
	const sessionID = nanoid();

	try {
		await db.insert(sessions).values({
			id: sessionID,
			userID,
			expiresAt: expiresAtDate,
		});

		return sessionID;
	} catch (error) {
		throw new DatabaseError(
			"セッションの作成中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function getSession(sessionID: string) {
	if (!sessionID || sessionID.trim() === "") {
		throw new InvalidInputError("指定されたセッションIDが無効です。");
	}

	try {
		const session = await db
			.select()
			.from(sessions)
			.where(eq(sessions.id, sessionID))
			.limit(1)
			.then((res) => res[0]);

		if (!session) {
			throw new QueryNotFoundError("セッションが見つかりませんでした。");
		}

		// 最終アクセス日時を更新
		await db
			.update(sessions)
			.set({ lastSeenAt: new Date() })
			.where(eq(sessions.id, sessionID));

		return session;
	} catch (error) {
		if (error instanceof QueryNotFoundError) {
			throw error;
		}

		throw new DatabaseError(
			"セッションの取得中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function deleteSession(sessionID: string) {
	if (!sessionID || sessionID.trim() === "") {
		return;
	}
	try {
		await db.delete(sessions).where(eq(sessions.id, sessionID));
	} catch (error) {
		throw new DatabaseError(
			"セッションの削除中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function saveChallenge(
	sessionID: string,
	challenge: string,
	userID?: string | null,
) {
	if (!sessionID || sessionID.trim() === "") {
		throw new InvalidInputError("指定されたセッションIDが無効です。");
	}

	if (!challenge || challenge.trim() === "") {
		throw new InvalidInputError("指定されたチャレンジが無効です。");
	}

	// チャレンジの有効期限は5分
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

	try {
		// 既存のチャレンジがあれば更新、なければ挿入
		await db
			.insert(webAuthnChallenges)
			.values({ sessionID, userID, challenge, expiresAt })
			.onConflictDoUpdate({
				target: webAuthnChallenges.sessionID,
				set: { challenge, expiresAt },
			});
	} catch (error) {
		if (error instanceof InvalidInputError) {
			throw error;
		}

		throw new DatabaseError(
			"チャレンジの保存中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function getChallengeData(sessionID: string) {
	if (!sessionID || sessionID.trim() === "") {
		throw new InvalidInputError("指定されたセッションIDが無効です。");
	}

	try {
		const record = await db
			.select()
			.from(webAuthnChallenges)
			.where(eq(webAuthnChallenges.sessionID, sessionID))
			.limit(1)
			.then((res) => res[0]);

		if (!record) {
			throw new QueryNotFoundError("チャレンジが見つかりませんでした。");
		}

		// チャレンジの有効期限を確認
		if (record.expiresAt <= new Date()) {
			throw new ExpiredChallengeError("チャレンジの有効期限が切れています。");
		}

		return record;
	} catch (error) {
		if (
			error instanceof QueryNotFoundError ||
			error instanceof ExpiredChallengeError
		) {
			throw error;
		}

		throw new DatabaseError(
			"チャレンジの取得中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function deleteChallenge(sessionID: string) {
	if (!sessionID || sessionID.trim() === "") {
		throw new InvalidInputError("指定されたセッションIDが無効です。");
	}

	try {
		await db
			.delete(webAuthnChallenges)
			.where(eq(webAuthnChallenges.sessionID, sessionID));
	} catch (error) {
		throw new DatabaseError(
			"チャレンジの削除中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function saveCredential(
	userID: string,
	credential: WebAuthnCredential,
) {
	if (!userID || userID.trim() === "") {
		throw new InvalidInputError("指定されたユーザーIDが無効です。");
	}

	if (!credential?.id || !credential.publicKey) {
		throw new InvalidInputError("指定されたクレデンシャルが無効です。");
	}

	try {
		await db.insert(credentials).values({
			id: credential.id,
			publicKey: credential.publicKey,
			userID: userID,
			counter: credential.counter,
		});
	} catch (error) {
		throw new DatabaseError(
			"クレデンシャルの保存中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function getCredential(credentialID: string) {
	if (!credentialID || credentialID.trim() === "") {
		throw new InvalidInputError("指定されたクレデンシャルIDが無効です。");
	}

	try {
		const credential = await db
			.select()
			.from(credentials)
			.where(eq(credentials.id, credentialID))
			.limit(1)
			.then((res) => res[0]);

		if (!credential) {
			throw new QueryNotFoundError("クレデンシャルが見つかりませんでした。");
		}

		return credential;
	} catch (error) {
		if (error instanceof QueryNotFoundError) {
			throw error;
		}

		throw new DatabaseError(
			"クレデンシャルの取得中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}
