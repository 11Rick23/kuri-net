"use server";

import { cookies } from "next/headers";
import { getSession } from "@/features/auth/data/repository";
import type { Session } from "@/types/database";

export async function verifySession(): Promise<Session | null> {
	const cookieStore = await cookies();
	const sessionID = cookieStore.get("sessionID")?.value;

	// セッションIDがクッキーに保存されていなければ失敗
	if (!sessionID) {
		return null;
	}

	try {
		const session = await getSession(sessionID);

		// セッションが存在し、有効期限内であれば成功
		if (session && session.expiresAt > new Date()) {
			return session;
		}
		// セッションが無効な場合はnullを返す
		return null;
	} catch {
		// セッションの取得に失敗した場合は無効とみなす
		return null;
	}
}
