"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import type { Result } from "@/types/result";
import { generateLoginOptions, verifyLoginData } from "./loginServerFunctions";

export default async function login(): Promise<Result<string, string>> {
	const optionsJSON = await generateLoginOptions();

	let result: AuthenticationResponseJSON;

	try {
		result = await startAuthentication({ optionsJSON });
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

	await verifyLoginData(result);

	return { ok: true, value: "ログインに成功しました。" };
}
