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
	deleteChallenge,
	deleteSession,
	getChallengeData,
	saveChallenge,
	saveCredential,
	updateUserStatus,
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
	await createUser(options.user.id);

	// セッションを生成
	const sessionID = await createSession();

	// セッションIDをクッキーに保存
	const cookieStore = await cookies();
	cookieStore.set("sessionID", sessionID, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30, // 最大30日間有効
	});

	// チャレンジをDBへ保存
	await saveChallenge(sessionID, options.challenge, options.user.id);

	// オプションを返す
	return options;
}

export async function verifyRegistrationData(
	response: RegistrationResponseJSON,
) {
	// セッションを検証
	const session = await verifySession();

	// セッションが存在しない場合は失敗
	if (!session?.id) {
		return null;
	}

	// 該当セッションで生成されたチャレンジを取得
	const { userID, challenge } = await getChallengeData(session.id);

	if (!challenge || !userID) {
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

	// パスキーを検証
	const verification = await verifyRegistrationResponse({
		response,
		expectedChallenge: challenge,
		expectedOrigin,
		expectedRPID,
	});

	// 検証に失敗した場合はnullを返す
	if (!verification.verified) {
		return null;
	}

	// 認証情報を保存
	await saveCredential(userID, verification.registrationInfo.credential);

	// ユーザーのステータスを更新
	await updateUserStatus(userID, "ACTIVE");

	// セッションを再生成・保存
	const sessionID = await createSession(userID);
	const cookieStore = await cookies();
	cookieStore.set("sessionID", sessionID, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30, // 最大30日間有効
	});

	// 古いセッションは削除する
	await deleteSession(session.id);

	return verification;
}
