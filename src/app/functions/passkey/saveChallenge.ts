import { eq } from "drizzle-orm";
import { db } from "@/database";
import { webAuthnChallenges } from "@/database/schema";

export async function saveChallenge(userId: string, challenge: string) {
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分後に期限切れ

	// 既存のチャレンジがあれば更新、なければ挿入
	await db
		.insert(webAuthnChallenges)
		.values({ userId, challenge, expiresAt })
		.onConflictDoUpdate({
			target: webAuthnChallenges.userId,
			set: { challenge, expiresAt },
		});
}
