"use server";

import { revalidatePath } from "next/cache";
import {
	cleanupRegisteringUser,
	completeRegisteringUser,
	getAuthUserStateByID,
	updateRegisteringDisplayName,
} from "@/features/auth/data/repository";
import { createAuthActions } from "@/features/auth/server/actionCore";
import { getRawSession } from "@/features/auth/server/session";
import type { Result } from "@/shared/types/result";

type ActionResult = Result<undefined, string>;

const actions = createAuthActions({
	getRawSession,
	getAuthUserStateByID,
	updateRegisteringDisplayName,
	completeRegisteringUser,
	cleanupRegisteringUser,
	revalidatePath,
});

export async function getPostLoginPath(): Promise<"/" | null> {
	return actions.getPostLoginPath();
}

export async function updateRegistrationDisplayName(
	displayName: string,
): Promise<ActionResult> {
	return actions.updateRegistrationDisplayName(displayName);
}

export async function completePasskeyRegistration(): Promise<ActionResult> {
	return actions.completePasskeyRegistration();
}

export async function cleanupIncompleteRegistration(): Promise<void> {
	return actions.cleanupIncompleteRegistration();
}
