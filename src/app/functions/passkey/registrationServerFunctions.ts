"use server";

import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import {
	generateRegistrationOptions,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { cookies } from "next/headers";

import {
	createSession,
	createUser,
	getChallenge,
	saveChallenge,
	saveCredential,
} from "./databaseFunctions";
import { verifySession } from "./verifySession";

export async function generateRegistrationData(userName: string) {
	// 開発環境と本番環境でrpIDを切り替え
	const rpID =
		process.env.NODE_ENV === "production" ? "kuri-kuri.net" : "localhost";

	const options = await generateRegistrationOptions({
		rpName: "kuri-net",
		rpID: rpID,
		userName: userName,
	});

	// 一時的なユーザーを作成
	const temporaryUntil = new Date(Date.now() + 1000 * 60 * 15); // 15分間有効
	const user = await createUser(options.user.id, temporaryUntil);

	// セッションを生成
	const sessionId = await createSession(user.id);

	// セッションIDをクッキーに保存
	const cookieStore = await cookies();
	cookieStore.set("sessionID", sessionId, {
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

export async function verifyRegistrationData(
	response: RegistrationResponseJSON,
) {
	// セッションを検証
	const session = await verifySession();

	// セッションが存在しない場合は失敗
	if (!session) {
		return null;
	}

	// 該当セッションで生成されたチャレンジを取得
	const expectedChallenge = await getChallenge(session.id);

	// チャレンジが存在しない場合は失敗
	if (!expectedChallenge) {
		return null;
	}

	// 開発環境と本番環境でoriginとrpIDを切り替え
	const expectedOrigin =
		process.env.NODE_ENV === "production"
			? "https://kuri-kuri.net"
			: "http://localhost:3000";

	const expectedRPID =
		process.env.NODE_ENV === "production" ? "kuri-kuri.net" : "localhost";

	// パスキーを検証
	const verification = await verifyRegistrationResponse({
		response,
		expectedChallenge,
		expectedOrigin,
		expectedRPID,
	});

	if (!verification.verified) {
		return null;
	}

	await saveCredential(
		session.userID,
		verification.registrationInfo.credential,
	);

	return verification;
}
