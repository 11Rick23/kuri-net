import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/database";
import { users } from "@/database/schema";
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

	const [currentUser] = await db
		.select({
			status: users.status,
			isAnonymous: users.isAnonymous,
			profileCompleted: users.profileCompleted,
		})
		.from(users)
		.where(eq(users.id, session.user.id))
		.limit(1);

	if (!isAuthenticatedUserState(currentUser)) {
		return null;
	}

	return session;
}
