"use server";

import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import {
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { cookies } from "next/headers";
import {
	createSession,
	getChallenge,
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
		throw new Error("Credential not found");
	}

	// セッションを検証・取得
	const session = await verifySession();
	if (!session) {
		throw new Error("Invalid session");
	}

	// チャレンジを取得
	const challenge = await getChallenge(session.id);
	if (!challenge) {
		throw new Error("Challenge not found or expired");
	}

	// 開発環境と本番環境でoriginとrpIDを切り替え
	const expectedOrigin =
		process.env.NODE_ENV === "production"
			? "https://kuri-kuri.net"
			: "http://localhost:3000";

	const expectedRPID =
		process.env.NODE_ENV === "production" ? "kuri-kuri.net" : "localhost";

    // 認証を検証
	const result = await verifyAuthenticationResponse({
		response,
		expectedChallenge: challenge,
		expectedOrigin,
		expectedRPID,
		credential,
	});

    if (!result.verified) {
        throw new Error("Authentication verification failed");
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

    return true;
}
