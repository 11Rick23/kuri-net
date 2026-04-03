"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { generateLoginOptions, verifyLoginData } from "@/features/auth/server/login";
import type { Result } from "@/shared/types/result";

export default async function login(): Promise<Result<string, string>> {
	const optionsJSON = await generateLoginOptions();

	try {
		const authRes = await startAuthentication({ optionsJSON });

		const veriRes = await verifyLoginData(authRes);

		if (!veriRes) {
			return {
				ok: false,
				error: "認証に失敗しました。",
			};
		} else {
			return {
				ok: true,
				value: "認証に成功しました。",
			};
		}
	} catch (error) {
		const name = error instanceof Error ? error.name : "";
		if (name === "NotAllowedError") {
			return {
				ok: false,
				error: "認証がキャンセルされました。",
			};
		}
		return {
			ok: false,
			error: "認証中に予期しないエラーが発生しました。",
		};
	}
}
