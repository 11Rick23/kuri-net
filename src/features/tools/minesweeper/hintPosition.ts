export type HintPopupRect = {
	top: number;
	left: number;
	width: number;
	height: number;
};

export type HintPopupPosition = {
	top: number;
	left: number;
};

function overlapArea(first: HintPopupRect, second: HintPopupRect) {
	const width = Math.max(
		0,
		Math.min(first.left + first.width, second.left + second.width) -
			Math.max(first.left, second.left),
	);
	const height = Math.max(
		0,
		Math.min(first.top + first.height, second.top + second.height) -
			Math.max(first.top, second.top),
	);
	return width * height;
}

export function getHintPopupPosition(
	anchor: HintPopupRect,
	popup: Pick<HintPopupRect, "width" | "height">,
	board: HintPopupRect,
	viewport: { width: number; height: number },
	targets: HintPopupRect[] = [],
): HintPopupPosition {
	const gap = 10;
	const padding = 12;
	const anchorCandidates = [
		{
			top: anchor.top - popup.height - gap,
			left: anchor.left + (anchor.width - popup.width) / 2,
		},
		{
			top: anchor.top + anchor.height + gap,
			left: anchor.left + (anchor.width - popup.width) / 2,
		},
		{
			top: anchor.top + (anchor.height - popup.height) / 2,
			left: anchor.left + anchor.width + gap,
		},
		{
			top: anchor.top + (anchor.height - popup.height) / 2,
			left: anchor.left - popup.width - gap,
		},
		{
			top: board.top - popup.height - gap,
			left: anchor.left + (anchor.width - popup.width) / 2,
		},
		{
			top: board.top + board.height + gap,
			left: anchor.left + (anchor.width - popup.width) / 2,
		},
		{
			top: anchor.top + (anchor.height - popup.height) / 2,
			left: board.left + board.width + gap,
		},
		{
			top: anchor.top + (anchor.height - popup.height) / 2,
			left: board.left - popup.width - gap,
		},
	];
	const viewportRect = {
		top: 0,
		left: 0,
		width: viewport.width,
		height: viewport.height,
	};
	const visibleTargets = targets.filter(
		(target) => overlapArea(target, viewportRect) > 0,
	);
	const obstacles = [anchor, ...visibleTargets];
	const leftCandidates = new Set([
		padding,
		viewport.width - popup.width - padding,
		...anchorCandidates.map((candidate) => candidate.left),
	]);
	const topCandidates = new Set([
		padding,
		viewport.height - popup.height - padding,
		...anchorCandidates.map((candidate) => candidate.top),
	]);
	for (const obstacle of obstacles) {
		leftCandidates.add(obstacle.left - popup.width - gap);
		leftCandidates.add(obstacle.left + obstacle.width + gap);
		topCandidates.add(obstacle.top - popup.height - gap);
		topCandidates.add(obstacle.top + obstacle.height + gap);
	}
	const candidates = [
		...anchorCandidates,
		...[...leftCandidates].flatMap((left) =>
			[...topCandidates].map((top) => ({ top, left })),
		),
	];
	const uniqueCandidates = new Map<string, HintPopupPosition>();
	for (const candidate of candidates) {
		const left = Math.min(
			viewport.width - popup.width - padding,
			Math.max(padding, candidate.left),
		);
		const top = Math.min(
			viewport.height - popup.height - padding,
			Math.max(padding, candidate.top),
		);
		uniqueCandidates.set(`${left}:${top}`, { top, left });
	}

	const best = [...uniqueCandidates.values()]
		.map(({ top, left }, index) => {
			const rect = {
				top,
				left,
				width: popup.width,
				height: popup.height,
			};
			const targetOverlaps = visibleTargets.map((target) =>
				overlapArea(rect, target),
			);
			const centerX = left + popup.width / 2;
			const centerY = top + popup.height / 2;
			return {
				top,
				left,
				coveredTargets: targetOverlaps.filter((area) => area > 0).length,
				targetOverlap: targetOverlaps.reduce((sum, area) => sum + area, 0),
				sourceOverlap: overlapArea(rect, anchor),
				distance: Math.hypot(
					centerX - (anchor.left + anchor.width / 2),
					centerY - (anchor.top + anchor.height / 2),
				),
				boardOverlap: overlapArea(rect, board),
				index,
			};
		})
		.sort(
			(first, second) =>
				first.coveredTargets - second.coveredTargets ||
				first.targetOverlap - second.targetOverlap ||
				first.sourceOverlap - second.sourceOverlap ||
				first.distance - second.distance ||
				first.boardOverlap - second.boardOverlap ||
				first.index - second.index,
		)[0];
	return { top: best.top, left: best.left };
}
