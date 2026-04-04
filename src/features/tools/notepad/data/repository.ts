import { eq } from "drizzle-orm";
import { db } from "@/database";
import { notepads } from "@/database/schema";
import { InvalidInputError } from "@/shared/errors/base";
import { DatabaseError } from "@/shared/errors/database";
import type { Notepad } from "@/types/database";

export async function getNotepadByUserID(
	userID: string,
): Promise<Notepad | null> {
	if (!userID || userID.trim() === "") {
		throw new InvalidInputError("指定されたユーザーIDが無効です。");
	}

	try {
		return await db
			.select()
			.from(notepads)
			.where(eq(notepads.userID, userID))
			.limit(1)
			.then((res) => res[0] ?? null);
	} catch (error) {
		throw new DatabaseError(
			"メモの取得中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}

export async function saveNotepad(
	userID: string,
	content: string,
): Promise<Notepad> {
	if (!userID || userID.trim() === "") {
		throw new InvalidInputError("指定されたユーザーIDが無効です。");
	}

	if (typeof content !== "string") {
		throw new InvalidInputError("指定されたメモ内容が無効です。");
	}

	try {
		const saved = await db
			.insert(notepads)
			.values({
				userID,
				content,
			})
			.onConflictDoUpdate({
				target: notepads.userID,
				set: {
					content,
					updatedAt: new Date(),
				},
			})
			.returning()
			.then((res) => res[0]);

		if (!saved) {
			throw new DatabaseError("メモの保存結果を取得できませんでした。");
		}

		return saved;
	} catch (error) {
		if (error instanceof InvalidInputError || error instanceof DatabaseError) {
			throw error;
		}

		throw new DatabaseError(
			"メモの保存中にデータベースでエラーが発生しました。",
			{ cause: error },
		);
	}
}
