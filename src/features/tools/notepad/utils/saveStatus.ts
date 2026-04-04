import type { SaveState } from "@/features/tools/notepad/hooks/useNotepadEditor";

function formatSavedAt(value: string | null) {
	if (!value) {
		return "保存済み";
	}

	const date = new Date(value);

	return `保存済み ${new Intl.DateTimeFormat("ja-JP", {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).format(date)}`;
}

export function getSaveStatusMessage(
	state: SaveState,
	lastSavedAt: string | null,
) {
	switch (state) {
		case "saving":
			return "保存中...";
		case "pending":
			return "未保存の変更があります";
		case "error":
			return "保存に失敗しました";
		default:
			return formatSavedAt(lastSavedAt);
	}
}

export function getSaveStatusClassName(state: SaveState) {
	switch (state) {
		case "error":
			return "text-ctp-red";
		case "pending":
			return "text-ctp-yellow";
		case "saving":
			return "text-ctp-sapphire";
		default:
			return "text-ctp-subtext1";
	}
}
