export type NotePosition = { x: number; y: number };

export function constrainNotePosition(
	position: NotePosition,
	origin: { left: number; top: number; width: number; height: number },
	viewport: { width: number; height: number; top: number },
): NotePosition {
	const minX = 16 - origin.left;
	const minY = viewport.top - origin.top;
	return {
		x: Math.max(
			minX,
			Math.min(
				position.x,
				Math.max(minX, viewport.width - origin.left - origin.width - 16),
			),
		),
		y: Math.max(
			minY,
			Math.min(
				position.y,
				Math.max(minY, viewport.height - origin.top - origin.height - 16),
			),
		),
	};
}
