"use client";

import { authClient } from "@/features/auth/client/authClient";
import { createLogin } from "@/features/auth/client/loginCore";
import { getPostLoginPath } from "@/features/auth/server/actions";
import type { Result } from "@/shared/types/result";

const passkeyLogin = createLogin({
	signInWithPasskey: () => authClient.signIn.passkey(),
	getPostLoginPath,
	signOut: () => authClient.signOut(),
});

export default async function login(): Promise<Result<"/", string>> {
	return passkeyLogin();
}
