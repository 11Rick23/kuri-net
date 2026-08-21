import {
	createBoardFromMines,
	getNeighborIndices,
} from "@/features/tools/minesweeper/board";
import {
	calculateAverageDifficultyScore,
	difficultyDistance,
	solutionMatchesDifficulty,
} from "@/features/tools/minesweeper/difficulty";
import {
	type DeductionRule,
	type DifficultyKey,
	type GenerateBoardOptions,
	type LogicalBoard,
	ruleCosts,
	type SolverResult,
} from "@/features/tools/minesweeper/model";
import {
	createRandomSeed,
	SeededRandom,
} from "@/features/tools/minesweeper/random";
import { solveBoard } from "@/features/tools/minesweeper/solver";

type EvaluatedCandidate = {
	board: LogicalBoard;
	result: SolverResult;
	distance: number;
};

type MineMutation = "move" | "add" | "remove";

function selectFirstIndex(width: number, height: number, random: SeededRandom) {
	const minX = width > 4 ? 1 : 0;
	const maxX = width > 4 ? width - 1 : width;
	const minY = height > 4 ? 1 : 0;
	const maxY = height > 4 ? height - 1 : height;
	return random.int(minY, maxY) * width + random.int(minX, maxX);
}

function createCandidate(
	options: GenerateBoardOptions,
	seed: string,
	mineCount = options.mineCount,
): LogicalBoard {
	const random = new SeededRandom(seed);
	const firstIndex = selectFirstIndex(options.width, options.height, random);
	const safeZone = new Set([
		firstIndex,
		...getNeighborIndices(firstIndex, options.width, options.height),
	]);
	const candidates = Array.from(
		{ length: options.width * options.height },
		(_, index) => index,
	).filter((index) => !safeZone.has(index));
	const mines = random.shuffle(candidates).slice(0, mineCount);
	return createBoardFromMines(
		options.width,
		options.height,
		mines,
		firstIndex,
		seed,
	);
}

function getMineCountBounds(options: GenerateBoardOptions) {
	const playableCells = options.width * options.height - 9;
	return {
		minimum: Math.max(1, Math.floor(options.mineCount * 0.7)),
		maximum: Math.min(
			playableCells,
			Math.max(options.mineCount + 2, Math.ceil(options.mineCount * 1.35)),
		),
	};
}

function mutateCandidate(
	board: LogicalBoard,
	mutation: MineMutation,
	random: SeededRandom,
	seed: string,
	bounds: ReturnType<typeof getMineCountBounds>,
) {
	const safeZone = new Set([
		board.firstIndex,
		...getNeighborIndices(board.firstIndex, board.width, board.height),
	]);
	const mines = board.cells
		.filter((cell) => cell.mine)
		.map((cell) => cell.index);
	const mineSet = new Set(mines);
	const emptyCandidates = board.cells
		.map((cell) => cell.index)
		.filter((index) => !safeZone.has(index) && !mineSet.has(index));
	const nextMines = [...mines];
	if (
		mutation === "add" &&
		nextMines.length < bounds.maximum &&
		emptyCandidates.length > 0
	) {
		nextMines.push(emptyCandidates[random.int(0, emptyCandidates.length)]);
	} else if (mutation === "remove" && nextMines.length > bounds.minimum) {
		nextMines.splice(random.int(0, nextMines.length), 1);
	} else if (nextMines.length > 0 && emptyCandidates.length > 0) {
		nextMines[random.int(0, nextMines.length)] =
			emptyCandidates[random.int(0, emptyCandidates.length)];
	}
	return createBoardFromMines(
		board.width,
		board.height,
		nextMines,
		board.firstIndex,
		seed,
	);
}

function defaultAttemptCount(difficulty: DifficultyKey) {
	return {
		beginner: 360,
		intermediate: 600,
		advanced: 900,
		expert: 1_200,
	}[difficulty];
}

function evaluateCandidate(
	board: LogicalBoard,
	difficulty: DifficultyKey,
	requestedMineCount: number,
): EvaluatedCandidate {
	const result = solveBoard(board);
	return {
		board,
		result,
		distance: difficultyDistance(
			result,
			difficulty,
			board.mineCount,
			requestedMineCount,
		),
	};
}

function finalizeCandidate(candidate: EvaluatedCandidate): LogicalBoard {
	const maxRule = (Object.entries(ruleCosts) as Array<[DeductionRule, number]>)
		.filter(([, cost]) => cost <= candidate.result.features.maxRuleCost)
		.sort((left, right) => right[1] - left[1])[0]?.[0];
	return {
		...candidate.board,
		difficultyScore: calculateAverageDifficultyScore(candidate.result.steps),
		difficultyFeatures: candidate.result.features,
		maxRule: maxRule ?? "remaining-mines-zero",
		solutionSteps: candidate.result.steps,
	};
}

export function generateLogicalBoard(
	options: GenerateBoardOptions,
): LogicalBoard {
	if (
		!Number.isInteger(options.width) ||
		!Number.isInteger(options.height) ||
		options.width < 5 ||
		options.height < 5 ||
		options.width > 20 ||
		options.height > 20
	) {
		throw new Error("盤面の幅と高さは5〜20の整数で指定してください。");
	}
	const largestSafeZone = Math.min(9, options.width * options.height);
	if (
		!Number.isInteger(options.mineCount) ||
		options.mineCount < 1 ||
		options.mineCount > options.width * options.height - largestSafeZone
	) {
		throw new Error("地雷数が盤面サイズに対して多すぎます。");
	}
	const baseSeed = options.seed?.trim() || createRandomSeed();
	const maxAttempts = Math.max(
		1,
		options.maxAttempts ?? defaultAttemptCount(options.difficulty),
	);
	const bounds = getMineCountBounds(options);
	const searchRandom = new SeededRandom(`${baseSeed}:local-search`);
	const mutationPattern: MineMutation[] = [
		"move",
		"add",
		"move",
		"remove",
		"move",
		"move",
	];
	let evaluationCount = 0;
	let restart = 0;
	while (evaluationCount < maxAttempts) {
		const initialSeed = `${baseSeed}:restart-${restart}`;
		const initialMineCount =
			restart === 0
				? options.mineCount
				: searchRandom.int(bounds.minimum, bounds.maximum + 1);
		let current = evaluateCandidate(
			createCandidate(options, initialSeed, initialMineCount),
			options.difficulty,
			options.mineCount,
		);
		evaluationCount += 1;
		if (solutionMatchesDifficulty(current.result, options.difficulty)) {
			return finalizeCandidate(current);
		}
		for (
			let iteration = 0;
			iteration < 48 && evaluationCount < maxAttempts;
			iteration += 1
		) {
			let bestNeighbor: EvaluatedCandidate | undefined;
			for (const mutation of searchRandom.shuffle(mutationPattern)) {
				if (evaluationCount >= maxAttempts) break;
				const mutationSeed = `${baseSeed}:restart-${restart}:candidate-${evaluationCount}`;
				const evaluated = evaluateCandidate(
					mutateCandidate(
						current.board,
						mutation,
						searchRandom,
						mutationSeed,
						bounds,
					),
					options.difficulty,
					options.mineCount,
				);
				evaluationCount += 1;
				if (solutionMatchesDifficulty(evaluated.result, options.difficulty)) {
					return finalizeCandidate(evaluated);
				}
				if (!bestNeighbor || evaluated.distance < bestNeighbor.distance) {
					bestNeighbor = evaluated;
				}
			}
			if (!bestNeighbor || bestNeighbor.distance >= current.distance) break;
			current = bestNeighbor;
		}
		restart += 1;
	}
	throw new Error(
		"指定した論理難度の条件を満たす盤面を生成できませんでした。探索をやり直してください。",
	);
}
