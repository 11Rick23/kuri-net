export const NOTE_WIDTH = 248;
export const NOTE_HEIGHT = 300;
const GAP = 16;
const TOP = 104;

export type NotePosition = { x: number; y: number };
export type NoteViewport = { width: number; height: number; scrollY?: number };

export function constrainNote(
	position: NotePosition,
	viewport: NoteViewport,
): NotePosition {
	const scrollY = viewport.scrollY ?? 0;
	return {
		x: Math.max(GAP, Math.min(position.x, viewport.width - NOTE_WIDTH - GAP)),
		y: Math.max(
			scrollY + TOP,
			Math.min(position.y, scrollY + viewport.height - NOTE_HEIGHT - GAP),
		),
	};
}

export function placeNote({
	left,
	right,
	top,
	viewport,
	occupied,
}: {
	left: number;
	right: number;
	top: number;
	viewport: NoteViewport;
	occupied: NotePosition[];
}): NotePosition {
	const candidates: NotePosition[] = [];
	for (const x of [right + GAP, left - NOTE_WIDTH - GAP]) {
		for (const y of [
			top,
			(viewport.scrollY ?? 0) + TOP,
			...occupied.flatMap((p) => [
				p.y + NOTE_HEIGHT + GAP,
				p.y - NOTE_HEIGHT - GAP,
			]),
		]) {
			candidates.push(constrainNote({ x, y }, viewport));
		}
	}
	const score = (candidate: NotePosition) => {
		const overlap = occupied.reduce(
			(total, other) =>
				total +
				Math.max(0, NOTE_WIDTH + GAP - Math.abs(candidate.x - other.x)) *
					Math.max(0, NOTE_HEIGHT + GAP - Math.abs(candidate.y - other.y)),
			0,
		);
		return overlap * 100 + Math.abs(candidate.y - top);
	};
	return candidates.reduce((best, candidate) =>
		score(candidate) < score(best) ? candidate : best,
	);
}
