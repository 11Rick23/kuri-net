"use server";

import { generateRegistrationOptions } from "@simplewebauthn/server";
import { headers } from "next/headers";
import { createSession, saveChallenge } from "./databaseFunctions";

export async function generateRegistrationData(userName: string) {
	const host = (await headers()).get("host") ?? "";

	const options = await generateRegistrationOptions({
		rpName: "kuri-net",
		rpID: host.includes("localhost") ? "localhost" : "kuri-kuri.net",
		userName: userName,
	});

	// セッションを生成
	const sessionId = await createSession(options.user.id);

	// チャレンジをDBへ保存
	await saveChallenge(sessionId, options.challenge);

	// オプションを返す
	return {options, sessionId};
}
