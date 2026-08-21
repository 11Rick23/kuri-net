"use server";

import { getAuthenticatedSession } from "@/features/auth/server/session";
import {
	getNotepadByUserID,
	saveNotepad,
} from "@/features/tools/notepad/data/repository";
import { InvalidInputError } from "@/shared/errors/base";

export async function getCurrentUserNotepad(): Promise<{
	content: string;
	updatedAt: string | null;
}> {
	const session = await getAuthenticatedSession();

	if (!session) {
		throw new Error("Authentication required.");
	}

	const notepad = await getNotepadByUserID(session.user.id);

	return {
		content: notepad?.content ?? "",
		updatedAt: notepad?.updatedAt ? notepad.updatedAt.toISOString() : null,
	};
}

export async function saveCurrentUserNotepad(content: string): Promise<{
	ok: true;
	updatedAt: string;
}> {
	if (typeof content !== "string") {
		throw new InvalidInputError("指定されたメモ内容が無効です。");
	}

	const session = await getAuthenticatedSession();

	if (!session) {
		throw new Error("Authentication required.");
	}

	const saved = await saveNotepad(session.user.id, content);

	return {
		ok: true,
		updatedAt: saved.updatedAt.toISOString(),
	};
}
