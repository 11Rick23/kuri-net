"use server";

import {
	generateAuthenticationOptions,
} from "@simplewebauthn/server";
import { cookies } from "next/headers";
import {
	createSession,
	saveChallenge,
} from "./databaseFunctions";

export async function generateLoginOptions() {
	// 開発環境と本番環境でrpIDを切り替え
	const rpID =
		process.env.NODE_ENV === "production" ? "kuri-kuri.net" : "localhost";

	// ログインオプションを生成
	const options = await generateAuthenticationOptions({ rpID: rpID });

	// セッションを生成
	const sessionID = await createSession(null);

	// セッションIDをクッキーに保存
	const cookieStore = await cookies();
	cookieStore.set("sessionID", sessionID, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	// チャレンジをDBへ保存
	await saveChallenge(sessionID, options.challenge);

	return options;
}
