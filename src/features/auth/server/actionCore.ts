import type { RegistrationCompletionResult } from "@/features/auth/data/repositoryCore";
import { validateDisplayName } from "@/features/auth/shared/displayName";
import {
	type AuthenticatedUserState,
	isAuthenticatedUserState,
} from "@/features/auth/shared/policy";
import type { Result } from "@/shared/types/result";

type ActionResult = Result<undefined, string>;

export type RawAuthSession = {
	user: { id: string };
};

export type AuthActionDependencies = {
	getRawSession: () => Promise<RawAuthSession | null>;
	getAuthUserStateByID: (
		userID: string,
	) => Promise<AuthenticatedUserState | undefined>;
	updateRegisteringDisplayName: (
		userID: string,
		displayName: string,
	) => Promise<boolean>;
	completeRegisteringUser: (
		userID: string,
	) => Promise<RegistrationCompletionResult>;
	cleanupRegisteringUser: (userID: string) => Promise<boolean>;
	revalidatePath: (path: string) => void;
};

export function createAuthActions(dependencies: AuthActionDependencies) {
	async function getPostLoginPath(): Promise<"/" | null> {
		const session = await dependencies.getRawSession();
		if (!session) {
			return null;
		}

		const user = await dependencies.getAuthUserStateByID(session.user.id);
		return isAuthenticatedUserState(user) ? "/" : null;
	}

	async function updateRegistrationDisplayName(
		displayName: string,
	): Promise<ActionResult> {
		const validated = validateDisplayName(displayName);
		if (!validated.ok) {
			return validated;
		}

		const session = await dependencies.getRawSession();
		if (!session) {
			return { ok: false, error: "登録セッションを確認できませんでした。" };
		}

		const updated = await dependencies.updateRegisteringDisplayName(
			session.user.id,
			validated.value,
		);
		if (!updated) {
			return { ok: false, error: "登録状態を更新できませんでした。" };
		}

		return { ok: true, value: undefined };
	}

	async function completePasskeyRegistration(): Promise<ActionResult> {
		const session = await dependencies.getRawSession();
		if (!session) {
			return { ok: false, error: "登録セッションを確認できませんでした。" };
		}

		const completion = await dependencies.completeRegisteringUser(
			session.user.id,
		);
		switch (completion.status) {
			case "completed":
				dependencies.revalidatePath("/");
				return { ok: true, value: undefined };
			case "invalid-display-name":
				return { ok: false, error: completion.error };
			case "missing-passkey":
				return {
					ok: false,
					error: "登録済みのパスキーを確認できません。",
				};
			case "invalid-user-state":
				return { ok: false, error: "登録状態が無効です。" };
		}
	}

	async function cleanupIncompleteRegistration(): Promise<void> {
		const session = await dependencies.getRawSession();
		if (!session) {
			return;
		}

		await dependencies.cleanupRegisteringUser(session.user.id);
	}

	return {
		getPostLoginPath,
		updateRegistrationDisplayName,
		completePasskeyRegistration,
		cleanupIncompleteRegistration,
	};
}
