"use server";

import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import {
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { cookies } from "next/headers";
import {
	createSession,
	deleteChallenge,
	deleteSession,
	getChallengeData,
	getCredential,
	saveChallenge,
} from "./databaseFunctions";
import { verifySession } from "./verifySession";

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

export async function verifyLoginData(response: AuthenticationResponseJSON) {
	// クレデンシャルを取得
	const credential = await getCredential(response.id);
	if (!credential) {
		return null;
	}

	// セッションを検証・取得
	const session = await verifySession();
	if (!session) {
		return null;
	}

	// チャレンジを取得
	const { challenge } = await getChallengeData(session.id);
	if (!challenge) {
		return null;
	}

	// 開発環境と本番環境でoriginとrpIDを切り替え
	const expectedOrigin =
		process.env.NODE_ENV === "production"
			? "https://kuri-kuri.net"
			: "http://localhost:3000";

	const expectedRPID =
		process.env.NODE_ENV === "production" ? "kuri-kuri.net" : "localhost";

	// 情報を取得したらチャレンジは削除してしまう
	await deleteChallenge(session.id);

	// 認証を検証
	const result = await verifyAuthenticationResponse({
		response,
		expectedChallenge: challenge,
		expectedOrigin,
		expectedRPID,
		credential,
	});

	if (!result.verified) {
		return null;
	}

	// 成功した場合はセッションを再生成する
	const newSessionID = await createSession(credential.userID);

	// 新しいセッションIDをクッキーに保存
	const cookieStore = await cookies();
	cookieStore.set("sessionID", newSessionID, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	// 古いセッションは削除する
	await deleteSession(session.id);

	return true;
}
