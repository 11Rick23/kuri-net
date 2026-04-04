"use server";

import { verifySession } from "@/features/auth/server/verifySession";
import {
	getNotepadByUserID,
	saveNotepad,
} from "@/features/tools/notepad/data/repository";
import { InvalidInputError } from "@/shared/errors/base";

export async function getCurrentUserNotepad(userID?: string): Promise<{
	content: string;
	updatedAt: string | null;
}> {
	let resolvedUserID = userID;

	if (!resolvedUserID) {
		const session = await verifySession();

		if (!session?.userID) {
			throw new Error("Authentication required.");
		}

		resolvedUserID = session.userID;
	}

	const notepad = await getNotepadByUserID(resolvedUserID);

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

	const session = await verifySession();

	if (!session?.userID) {
		throw new Error("Authentication required.");
	}

	const saved = await saveNotepad(session.userID, content);

	return {
		ok: true,
		updatedAt: saved.updatedAt.toISOString(),
	};
}
