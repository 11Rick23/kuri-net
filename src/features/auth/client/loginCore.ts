import type { Result } from "@/shared/types/result";

type AuthClientResult = {
	error?: unknown;
};

export type LoginDependencies = {
	signInWithPasskey: () => Promise<AuthClientResult>;
	getPostLoginPath: () => Promise<"/" | null>;
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

async function discardRejectedSession(
	dependencies: LoginDependencies,
): Promise<void> {
	try {
		await dependencies.signOut();
	} catch {
		// sign-outが失敗しても、ログイン失敗はResultとして返す。
	}
}

export function createLogin(dependencies: LoginDependencies) {
	return async function login(): Promise<Result<"/", string>> {
		try {
			const result = await dependencies.signInWithPasskey();

			if (result.error) {
				return {
					ok: false,
					error:
						getErrorCode(result.error) === "AUTH_CANCELLED"
							? "認証がキャンセルされました。"
							: "パスキーで認証できませんでした。",
				};
			}

			const path = await dependencies.getPostLoginPath();
			if (!path) {
				await discardRejectedSession(dependencies);
				return { ok: false, error: "このアカウントは利用できません。" };
			}

			return { ok: true, value: path };
		} catch {
			await discardRejectedSession(dependencies);
			return { ok: false, error: "パスキーで認証できませんでした。" };
		}
	};
}
