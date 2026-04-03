"use client";

import { startRegistration } from "@simplewebauthn/browser";
import {
	generateRegistrationData,
	verifyRegistrationData,
} from "@/features/auth/server/registration";
import type { Result } from "@/shared/types/result";

export default async function register(
	userName: string,
): Promise<Result<string, string>> {
	try {
		// チャレンジとユーザーIDを取得
		const options = await generateRegistrationData(userName);

		// パスキーの作成を開始
		const response = await startRegistration({ optionsJSON: options });

		// パスキーを検証
		await verifyRegistrationData(response);

		return { ok: true, value: "登録に成功しました。" };
	} catch (error) {
		if (error instanceof Error && error.name === "NotAllowedError") {
			return { ok: false, error: "登録がキャンセルされました" };
		}
		return { ok: false, error: "登録中にエラーが発生しました" };
	}
}
