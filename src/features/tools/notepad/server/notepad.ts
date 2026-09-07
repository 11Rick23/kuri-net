"use server";

import { getAuthenticatedSession } from "@/features/auth/server/session";
import {
	getNotepadByUserID,
	saveNotepad,
} from "@/features/tools/notepad/data/repository";
import { validateNotepadContent } from "@/features/tools/notepad/domain/content";
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

export async function saveCurrentUserNotepad(content: unknown): Promise<{
	ok: true;
	updatedAt: string;
}> {
	const validated = validateNotepadContent(content);

	if (!validated.ok) {
		throw new InvalidInputError(validated.error);
	}

	const session = await getAuthenticatedSession();

	if (!session) {
		throw new Error("Authentication required.");
	}

	const saved = await saveNotepad(session.user.id, validated.value);

	return {
		ok: true,
		updatedAt: saved.updatedAt.toISOString(),
	};
}
