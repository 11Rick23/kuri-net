import { headers } from "next/headers";
import { getAuthUserStateByID } from "@/features/auth/data/repository";
import { auth } from "@/features/auth/server/auth";
import { isAuthenticatedUserState } from "@/features/auth/shared/policy";

export async function getRawSession() {
	return auth.api.getSession({ headers: await headers() });
}

export async function getAuthenticatedSession() {
	const session = await getRawSession();
	if (!session) {
		return null;
	}

	const currentUser = await getAuthUserStateByID(session.user.id);

	if (!isAuthenticatedUserState(currentUser)) {
		return null;
	}

	return session;
}
