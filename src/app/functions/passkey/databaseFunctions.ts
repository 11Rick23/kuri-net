import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/database";
import { sessions, users, webAuthnChallenges } from "@/database/schema";

export async function createUser(userId: string, temporaryUntil?: Date) {
	await db.insert(users).values({
		id: userId,
		temporaryUntil: temporaryUntil,
	});

	return await getUser(userId);
}

export async function getUser(userId: string) {
	const user = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1)
		.then((res) => res[0]);

	return user;
}

export async function createSession(
	userId: string,
	expiresAt: number = 1000 * 60 * 60 * 24 * 30, // デフォルトで30日間有効
) {
	const expiresAtDate = new Date(Date.now() + expiresAt);

	const sessionId = nanoid();

	await db.insert(sessions).values({
		id: sessionId,
		userId,
		expiresAt: expiresAtDate,
	});

	return sessionId;
}

export async function getSession(sessionId: string) {
	const session = await db
		.select()
		.from(sessions)
		.where(eq(sessions.id, sessionId))
		.limit(1)
		.then((res) => res[0]);

	await db
		.update(sessions)
		.set({ lastSeenAt: new Date() })
		.where(eq(sessions.id, sessionId));

	return session;
}

export async function saveChallenge(sessionId: string, challenge: string) {
	// チャレンジの有効期限は5分
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

	// 既存のチャレンジがあれば更新、なければ挿入
	await db
		.insert(webAuthnChallenges)
		.values({ sessionId, challenge, expiresAt })
		.onConflictDoUpdate({
			target: webAuthnChallenges.sessionId,
			set: { challenge, expiresAt },
		});
}
