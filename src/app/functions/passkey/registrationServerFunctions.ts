"use server";

import { generateRegistrationOptions } from "@simplewebauthn/server";
import { cookies, headers } from "next/headers";
import { createSession, createUser, saveChallenge } from "./databaseFunctions";

export async function generateRegistrationData(userName: string) {
	const host = (await headers()).get("host") ?? "";

	const options = await generateRegistrationOptions({
		rpName: "kuri-net",
		rpID: host.includes("localhost") ? "localhost" : "kuri-kuri.net",
		userName: userName,
	});

	// 一時的なユーザーを作成
	const temporaryUntil = new Date(Date.now() + 1000 * 60 * 15); // 15分間有効
	const user = await createUser(options.user.id, temporaryUntil);

	// セッションを生成
	const sessionId = await createSession(user.id);

	// セッションIDをクッキーに保存
	const cookieStore = await cookies();
	cookieStore.set("sessionId", sessionId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30, // 最大30日間有効
	});

	// チャレンジをDBへ保存
	await saveChallenge(sessionId, options.challenge);

	// オプションを返す
	return options;
}
