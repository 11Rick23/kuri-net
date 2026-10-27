export const NOTEPAD_CONTENT_MAX_CODE_POINTS = 200_000;

export const NOTEPAD_CONTENT_INVALID_ERROR = "指定されたメモ内容が無効です。";
export const NOTEPAD_CONTENT_TOO_LONG_ERROR = `メモ本文は${NOTEPAD_CONTENT_MAX_CODE_POINTS.toLocaleString("ja-JP")}文字以内で入力してください。`;

export type NotepadContentValidationResult =
	| { ok: true; value: string }
	| { ok: false; error: string };

export function countUnicodeCodePoints(value: string): number {
	let count = 0;

	for (const _codePoint of value) {
		count += 1;
	}

	return count;
}

export function validateNotepadContent(
	value: unknown,
): NotepadContentValidationResult {
	if (typeof value !== "string") {
		return { ok: false, error: NOTEPAD_CONTENT_INVALID_ERROR };
	}

	if (countUnicodeCodePoints(value) > NOTEPAD_CONTENT_MAX_CODE_POINTS) {
		return { ok: false, error: NOTEPAD_CONTENT_TOO_LONG_ERROR };
	}

	return { ok: true, value };
}
