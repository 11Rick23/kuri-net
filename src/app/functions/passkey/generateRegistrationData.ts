"use server";

import crypto from "crypto";
import { nanoid } from "nanoid";
import { db } from "@/database";
import { challenges } from "@/database/schema";

export async function generateRegistrationData() {
	const challenge = crypto.randomBytes(32);
	const encoded = challenge.toString("base64url");

	const userId = nanoid();

	await db.insert(challenges).values({
		challenge: encoded,
		expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5分後に期限切れ
		userId: userId,
	});

	return { encodedChallenge: encoded, userId };
}
