"use server";

import { cookies } from "next/headers";
import { getSession } from "./databaseFunctions";

export async function verifySession() {
	const cookieStore = await cookies();
	const sessionID = cookieStore.get("sessionID")?.value;

	// セッションIDがなければ失敗
	if (!sessionID) {
		return null;
	}

	const session = await getSession(sessionID);

	// セッションが存在し、有効期限内であれば成功
	if (session && session.expiresAt > new Date()) {
		return session;
	}
	// それ以外は失敗
	return null;
}
