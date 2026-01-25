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

export async function createUser(userID: string, temporaryUntil?: Date) {
	await db.insert(users).values({
		id: userID,
		temporaryUntil: temporaryUntil,
	});

	return await getUser(userID);
}

export async function getUser(userID: string) {
	const user = await db
		.select()
		.from(users)
		.where(eq(users.id, userID))
		.limit(1)
		.then((res) => res[0]);

	return user;
}

export async function createSession(
	userID: string | null = null,
	expiresAt: number = 1000 * 60 * 60 * 24 * 30, // デフォルトで30日間有効
) {
	const expiresAtDate = new Date(Date.now() + expiresAt);

	const sessionID = nanoid();

	await db.insert(sessions).values({
		id: sessionID,
		userID,
		expiresAt: expiresAtDate,
	});

	return sessionID;
}

export async function getSession(sessionID: string) {
	const session = await db
		.select()
		.from(sessions)
		.where(eq(sessions.id, sessionID))
		.limit(1)
		.then((res) => res[0]);

	await db
		.update(sessions)
		.set({ lastSeenAt: new Date() })
		.where(eq(sessions.id, sessionID));

	return session;
}

export async function saveChallenge(sessionID: string, challenge: string) {
	// チャレンジの有効期限は5分
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

	// 既存のチャレンジがあれば更新、なければ挿入
	await db
		.insert(webAuthnChallenges)
		.values({ sessionID, challenge, expiresAt })
		.onConflictDoUpdate({
			target: webAuthnChallenges.sessionID,
			set: { challenge, expiresAt },
		});
}

export async function getChallenge(sessionID: string) {
	const record = await db
		.select()
		.from(webAuthnChallenges)
		.where(eq(webAuthnChallenges.sessionID, sessionID))
		.limit(1)
		.then((res) => res[0]);

	if (record && record.expiresAt > new Date()) {
		return record.challenge;
	}
	return null;
}

export async function saveCredential(
	userID: string,
	credential: WebAuthnCredential,
) {
	await db.insert(credentials).values({
		id: credential.id,
		publicKey: credential.publicKey,
		userID: userID,
		counter: credential.counter,
	});
}

export async function getCredential(credentialID: string) {
	const credential = await db
		.select()
		.from(credentials)
		.where(eq(credentials.id, credentialID))
		.limit(1)
		.then((res) => res[0]);

	return credential;
}
