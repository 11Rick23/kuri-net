"use server";

import { generateRegistrationOptions } from "@simplewebauthn/server";
import { headers } from "next/headers";
import { saveChallenge } from "./saveChallenge";

export async function generateRegistrationData(userName: string) {
	const host = (await headers()).get("host") ?? "";

	const options = await generateRegistrationOptions({
		rpName: "kuri-net",
		rpID: host.includes("localhost") ? "localhost" : "kuri-kuri.net",
		userName: userName,
	});

	// チャレンジをDBへ保存
	await saveChallenge(options.user.id, options.challenge);

	// オプションを返す
	return options;
}
