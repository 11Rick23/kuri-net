import { validateDisplayName } from "@/features/auth/shared/displayName";
import type { Result } from "@/shared/types/result";

type AuthClientResult = {
	data?: unknown;
	error?: unknown;
};

type ActionResult = Result<undefined, string>;

export type RegistrationDependencies = {
	signInAnonymously: () => Promise<AuthClientResult>;
	updateDisplayName: (displayName: string) => Promise<ActionResult>;
	addPasskey: (displayName: string) => Promise<AuthClientResult>;
	completeRegistration: () => Promise<ActionResult>;
	cleanupRegistration: () => Promise<void>;
	signOut: () => Promise<unknown>;
};

function getErrorCode(error: unknown): string | undefined {
	if (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		typeof error.code === "string"
	) {
		return error.code;
	}

	return undefined;
}

async function discardProvisionalRegistration(
	dependencies: RegistrationDependencies,
): Promise<void> {
	try {
		await dependencies.cleanupRegistration();
	} catch {
		// cleanupの失敗で元の登録結果を上書きせず、sign-outも続ける。
	}

	try {
		await dependencies.signOut();
	} catch {
		// 呼び出し元には元の登録失敗をResultとして返す。
	}
}

export function createRegistration(dependencies: RegistrationDependencies) {
	return async function register(
		displayName: string,
	): Promise<Result<string, string>> {
		const validated = validateDisplayName(displayName);
		if (!validated.ok) {
			return validated;
		}

		let provisionalSessionCreated = false;

		try {
			const anonymousResult = await dependencies.signInAnonymously();
			if (anonymousResult.error || !anonymousResult.data) {
				return { ok: false, error: "登録を開始できませんでした。" };
			}
			provisionalSessionCreated = true;

			const displayNameResult = await dependencies.updateDisplayName(
				validated.value,
			);
			if (!displayNameResult.ok) {
				throw new Error(displayNameResult.error);
			}

			const passkeyResult = await dependencies.addPasskey(validated.value);
			if (passkeyResult.error || !passkeyResult.data) {
				const cancelled =
					getErrorCode(passkeyResult.error) === "ERROR_CEREMONY_ABORTED";
				throw new Error(cancelled ? "REGISTRATION_CANCELLED" : "PASSKEY_ERROR");
			}

			const completionResult = await dependencies.completeRegistration();
			if (!completionResult.ok) {
				throw new Error(completionResult.error);
			}

			return { ok: true, value: "登録に成功しました。" };
		} catch (error) {
			if (provisionalSessionCreated) {
				await discardProvisionalRegistration(dependencies);
			}

			return {
				ok: false,
				error:
					error instanceof Error && error.message === "REGISTRATION_CANCELLED"
						? "登録がキャンセルされました。"
						: "登録中にエラーが発生しました。",
			};
		}
	};
}
