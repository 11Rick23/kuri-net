"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/database";
import { authPasskeys, authSessions, users } from "@/database/schema";
import { getRawSession } from "@/features/auth/server/session";
import { validateDisplayName } from "@/features/auth/shared/displayName";
import type { Result } from "@/shared/types/result";

type ActionResult = Result<undefined, string>;

export async function getPostLoginPath(): Promise<"/" | null> {
	const session = await getRawSession();
	if (!session) {
		return null;
	}

	const [user] = await db
		.select({
			status: users.status,
			isAnonymous: users.isAnonymous,
			profileCompleted: users.profileCompleted,
		})
		.from(users)
		.where(eq(users.id, session.user.id))
		.limit(1);

	if (!user || user.status === "SUSPENDED" || user.isAnonymous) {
		return null;
	}

	return user.status === "ACTIVE" && user.profileCompleted ? "/" : null;
}

export async function updateRegistrationDisplayName(
	displayName: string,
): Promise<ActionResult> {
	const validated = validateDisplayName(displayName);
	if (!validated.ok) {
		return validated;
	}

	const session = await getRawSession();
	if (!session) {
		return { ok: false, error: "登録セッションを確認できませんでした。" };
	}

	const updated = await db
		.update(users)
		.set({ name: validated.value, updatedAt: new Date() })
		.where(
			and(
				eq(users.id, session.user.id),
				eq(users.status, "REGISTERING"),
				eq(users.isAnonymous, true),
			),
		)
		.returning({ id: users.id });

	if (updated.length !== 1) {
		return { ok: false, error: "登録状態を更新できませんでした。" };
	}

	return { ok: true, value: undefined };
}

export async function completePasskeyRegistration(): Promise<ActionResult> {
	const session = await getRawSession();
	if (!session) {
		return { ok: false, error: "登録セッションを確認できませんでした。" };
	}

	return db.transaction(async (tx) => {
		const [user] = await tx
			.select({
				id: users.id,
				name: users.name,
				status: users.status,
				isAnonymous: users.isAnonymous,
			})
			.from(users)
			.where(eq(users.id, session.user.id))
			.for("update")
			.limit(1);

		if (!user || user.status !== "REGISTERING" || !user.isAnonymous) {
			return { ok: false, error: "登録状態が無効です。" };
		}

		const displayName = validateDisplayName(user.name);
		if (!displayName.ok) {
			return displayName;
		}

		const [ownedPasskey] = await tx
			.select({ id: authPasskeys.id })
			.from(authPasskeys)
			.where(eq(authPasskeys.userId, user.id))
			.limit(1);

		if (!ownedPasskey) {
			return { ok: false, error: "登録済みのパスキーを確認できません。" };
		}

		await tx
			.update(authPasskeys)
			.set({ name: displayName.value })
			.where(eq(authPasskeys.id, ownedPasskey.id));

		await tx
			.update(users)
			.set({
				name: displayName.value,
				status: "ACTIVE",
				isAnonymous: false,
				profileCompleted: true,
				updatedAt: new Date(),
			})
			.where(eq(users.id, user.id));

		revalidatePath("/");
		return { ok: true, value: undefined };
	});
}

export async function cleanupIncompleteRegistration(): Promise<void> {
	const session = await getRawSession();
	if (!session) {
		return;
	}

	await db.transaction(async (tx) => {
		const [user] = await tx
			.select({ id: users.id })
			.from(users)
			.where(
				and(
					eq(users.id, session.user.id),
					eq(users.status, "REGISTERING"),
					eq(users.isAnonymous, true),
				),
			)
			.for("update")
			.limit(1);

		if (!user) {
			return;
		}

		const [passkey] = await tx
			.select({ id: authPasskeys.id })
			.from(authPasskeys)
			.where(eq(authPasskeys.userId, user.id))
			.limit(1);

		if (passkey) {
			return;
		}

		await tx.delete(authSessions).where(eq(authSessions.userId, user.id));
		await tx.delete(users).where(eq(users.id, user.id));
	});
}
