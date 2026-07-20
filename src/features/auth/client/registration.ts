"use client";

import { authClient } from "@/features/auth/client/authClient";
import {
	cleanupIncompleteRegistration,
	completePasskeyRegistration,
	updateRegistrationDisplayName,
} from "@/features/auth/server/actions";
import { validateDisplayName } from "@/features/auth/shared/displayName";
import type { Result } from "@/shared/types/result";

export default async function register(
	displayName: string,
): Promise<Result<string, string>> {
	const validated = validateDisplayName(displayName);
	if (!validated.ok) {
		return validated;
	}

	let provisionalSessionCreated = false;

	try {
		const anonymousResult = await authClient.signIn.anonymous();
		if (anonymousResult.error || !anonymousResult.data) {
			return { ok: false, error: "登録を開始できませんでした。" };
		}
		provisionalSessionCreated = true;

		const displayNameResult = await updateRegistrationDisplayName(
			validated.value,
		);
		if (!displayNameResult.ok) {
			throw new Error(displayNameResult.error);
		}

		const passkeyResult = await authClient.passkey.addPasskey({
			name: validated.value,
		});
		if (passkeyResult.error || !passkeyResult.data) {
			const cancelled =
				passkeyResult.error &&
				"code" in passkeyResult.error &&
				passkeyResult.error.code === "ERROR_CEREMONY_ABORTED";
			throw new Error(cancelled ? "REGISTRATION_CANCELLED" : "PASSKEY_ERROR");
		}

		const completionResult = await completePasskeyRegistration();
		if (!completionResult.ok) {
			throw new Error(completionResult.error);
		}

		return { ok: true, value: "登録に成功しました。" };
	} catch (error) {
		if (provisionalSessionCreated) {
			await cleanupIncompleteRegistration();
			await authClient.signOut();
		}

		return {
			ok: false,
			error:
				error instanceof Error && error.message === "REGISTRATION_CANCELLED"
					? "登録がキャンセルされました。"
					: "登録中にエラーが発生しました。",
		};
	}
}
