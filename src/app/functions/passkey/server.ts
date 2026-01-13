"use server";

import crypto from "crypto";
import { nanoid } from "nanoid";

export async function generateChallenge(): Promise<string> {
	const challenge = crypto.randomBytes(32);
	const encoded = challenge.toString("base64url");
	return encoded;
}

export async function generateUserId() {
	return nanoid();
}
