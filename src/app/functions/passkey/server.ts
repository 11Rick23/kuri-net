"use server";

import crypto from "crypto";
import { nanoid } from "nanoid";

export async function generateChallenge(): Promise<Uint8Array> {
	return crypto.randomBytes(32);
}

export async function generateUserId() {
	return nanoid();
}
