import {
	emptyDifficultyFeatures,
	type LogicalBoard,
} from "@/features/tools/minesweeper/model";

export function getNeighborIndices(
	index: number,
	width: number,
	height: number,
) {
	const x = index % width;
	const y = Math.floor(index / width);
	const neighbors: number[] = [];
	for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
		for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
			if (offsetX === 0 && offsetY === 0) continue;
			const nextX = x + offsetX;
			const nextY = y + offsetY;
			if (nextX >= 0 && nextY >= 0 && nextX < width && nextY < height) {
				neighbors.push(nextY * width + nextX);
			}
		}
	}
	return neighbors.sort((left, right) => left - right);
}

export function createBoardFromMines(
	width: number,
	height: number,
	mineIndices: number[],
	firstIndex: number,
	seed: string,
): LogicalBoard {
	const mines = new Set(mineIndices);
	const cells = Array.from({ length: width * height }, (_, index) => ({
		index,
		mine: mines.has(index),
		adjacentMines: 0,
	}));
	for (const cell of cells) {
		if (!cell.mine) {
			cell.adjacentMines = getNeighborIndices(cell.index, width, height).filter(
				(index) => mines.has(index),
			).length;
		}
	}
	return {
		width,
		height,
		mineCount: mines.size,
		firstIndex,
		seed,
		cells,
		difficultyScore: 0,
		difficultyFeatures: { ...emptyDifficultyFeatures },
		maxRule: "remaining-mines-zero",
		solutionSteps: [],
	};
}

export function getOpeningCells(
	board: LogicalBoard,
	startIndex: number,
	blocked = new Set<number>(),
) {
	const start = board.cells[startIndex];
	if (!start || start.mine || blocked.has(startIndex)) return [];
	const visited = new Set<number>();
	const queue = [startIndex];
	for (let cursor = 0; cursor < queue.length; cursor += 1) {
		const index = queue[cursor];
		if (visited.has(index) || blocked.has(index)) continue;
		const cell = board.cells[index];
		if (!cell || cell.mine) continue;
		visited.add(index);
		if (cell.adjacentMines === 0) {
			for (const neighbor of getNeighborIndices(
				index,
				board.width,
				board.height,
			)) {
				if (!visited.has(neighbor)) queue.push(neighbor);
			}
		}
	}
	return [...visited].sort((left, right) => left - right);
}

export function isBoardWon(board: LogicalBoard, revealed: Set<number>) {
	return revealed.size === board.cells.length - board.mineCount;
}

export function formatElapsedTime(seconds: number) {
	const minutes = Math.floor(seconds / 60)
		.toString()
		.padStart(2, "0");
	const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
	return `${minutes}:${remainingSeconds}`;
}

export function formatCellLabel(
	board: LogicalBoard,
	index: number,
	options: {
		revealed: boolean;
		flagged: boolean;
		showMine: boolean;
		first: boolean;
		hintSource?: boolean;
	},
) {
	const cell = board.cells[index];
	const row = Math.floor(index / board.width) + 1;
	const column = (index % board.width) + 1;
	let state = "未公開";
	if (options.flagged) state = "旗";
	else if (options.showMine && cell.mine) state = "地雷";
	else if (options.revealed) {
		state =
			cell.adjacentMines === 0
				? "安全な空きマス"
				: `周囲の地雷 ${cell.adjacentMines}個`;
	}
	const annotations = [
		options.first ? "初手" : "",
		options.hintSource ? "ヒントの根拠" : "",
	].filter(Boolean);
	return [`${row}行 ${column}列`, state, ...annotations].join("、");
}
