export const DISPLAY_NAME_MAX_LENGTH = 100;
export const DEFAULT_DISPLAY_NAME = "名無し";

const CONTROL_CHARACTER_PATTERN = /\p{Cc}/u;

export function validateDisplayName(
	value: string,
): { ok: true; value: string } | { ok: false; error: string } {
	if (CONTROL_CHARACTER_PATTERN.test(value)) {
		return { ok: false, error: "表示名に制御文字は使用できません。" };
	}

	const normalized = value.trim();

	if (normalized.length === 0) {
		return { ok: false, error: "表示名を入力してください。" };
	}

	if (Array.from(normalized).length > DISPLAY_NAME_MAX_LENGTH) {
		return {
			ok: false,
			error: `表示名は${DISPLAY_NAME_MAX_LENGTH}文字以内で入力してください。`,
		};
	}

	return { ok: true, value: normalized };
}
