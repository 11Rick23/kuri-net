"use client";

import { authClient } from "@/features/auth/client/authClient";
import { createRegistration } from "@/features/auth/client/registrationCore";
import {
	cleanupIncompleteRegistration,
	completePasskeyRegistration,
	updateRegistrationDisplayName,
} from "@/features/auth/server/actions";
import type { Result } from "@/shared/types/result";

const registration = createRegistration({
	signInAnonymously: () => authClient.signIn.anonymous(),
	updateDisplayName: updateRegistrationDisplayName,
	addPasskey: (displayName) =>
		authClient.passkey.addPasskey({ name: displayName }),
	completeRegistration: completePasskeyRegistration,
	cleanupRegistration: cleanupIncompleteRegistration,
	signOut: () => authClient.signOut(),
});

export default async function register(
	displayName: string,
): Promise<Result<string, string>> {
	return registration(displayName);
}
