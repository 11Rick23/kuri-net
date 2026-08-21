"use client";

import { authClient } from "@/features/auth/client/authClient";
import { getPostLoginPath } from "@/features/auth/server/actions";
import type { Result } from "@/shared/types/result";

export default async function login(): Promise<Result<"/", string>> {
	const result = await authClient.signIn.passkey();

	if (result.error) {
		const errorCode = "code" in result.error ? result.error.code : undefined;
		return {
			ok: false,
			error:
				errorCode === "AUTH_CANCELLED"
					? "認証がキャンセルされました。"
					: "パスキーで認証できませんでした。",
		};
	}

	const path = await getPostLoginPath();
	if (!path) {
		await authClient.signOut();
		return { ok: false, error: "このアカウントは利用できません。" };
	}

	return { ok: true, value: path };
}
