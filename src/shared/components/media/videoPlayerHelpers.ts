export function formatMediaTime(value: number): string {
	if (!Number.isFinite(value) || value < 0) return "0:00";

	const totalSeconds = Math.floor(value);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function resolveMediaProgress(
	currentTime: number,
	duration: number,
): { max: number; value: number } {
	const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
	const safeCurrentTime =
		Number.isFinite(currentTime) && currentTime > 0 ? currentTime : 0;

	return {
		max,
		value: Math.min(safeCurrentTime, max),
	};
}
