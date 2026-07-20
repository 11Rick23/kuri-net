export type DifficultyKey = "beginner" | "intermediate" | "advanced" | "expert";

export type DifficultyDefinition = {
	label: string;
	width: number;
	height: number;
	mineCount: number;
};

export const difficultyDefinitions: Record<
	DifficultyKey,
	DifficultyDefinition
> = {
	beginner: { label: "入門", width: 9, height: 9, mineCount: 10 },
	intermediate: { label: "中級", width: 12, height: 12, mineCount: 24 },
	advanced: { label: "上級", width: 16, height: 16, mineCount: 40 },
	expert: { label: "熟練", width: 16, height: 16, mineCount: 48 },
};

export const difficultyKeys = Object.keys(
	difficultyDefinitions,
) as DifficultyKey[];

export type DeductionRule =
	| "remaining-mines-zero"
	| "all-unknown-are-mines"
	| "subset-difference"
	| "global-mine-count"
	| "constraint-enumeration";

export type DeductionAction = "reveal" | "flag" | "unflag";

export type Deduction = {
	action: DeductionAction;
	targets: number[];
	sources: number[];
	rule: DeductionRule;
	explanation: string;
};

export type BoardCell = {
	index: number;
	mine: boolean;
	adjacentMines: number;
};

export type LogicalBoard = {
	width: number;
	height: number;
	mineCount: number;
	firstIndex: number;
	seed: string;
	cells: BoardCell[];
	difficultyScore: number;
	maxRule: DeductionRule;
	solutionSteps: Deduction[];
};

export type GenerateBoardOptions = {
	width: number;
	height: number;
	mineCount: number;
	difficulty: DifficultyKey;
	seed?: string;
	maxAttempts?: number;
};

type Constraint = {
	variables: number[];
	remainingMines: number;
	sources: number[];
};

type DeductionResult = {
	deduction: Deduction | null;
	contradiction: boolean;
	maxConstraintSize: number;
};

type SolverResult = {
	solved: boolean;
	contradiction: boolean;
	steps: Deduction[];
	maxRuleCost: number;
	subsetCount: number;
	enumerationCount: number;
};

const ruleCosts: Record<DeductionRule, number> = {
	"remaining-mines-zero": 1,
	"all-unknown-are-mines": 1,
	"subset-difference": 3,
	"global-mine-count": 5,
	"constraint-enumeration": 8,
};

export const ruleLabels: Record<DeductionRule, string> = {
	"remaining-mines-zero": "残雷0",
	"all-unknown-are-mines": "全候補",
	"subset-difference": "集合差",
	"global-mine-count": "全体残数",
	"constraint-enumeration": "制約列挙",
};

const explanations: Record<DeductionRule, Record<"reveal" | "flag", string>> = {
	"remaining-mines-zero": {
		reveal:
			"数字の周囲で必要な地雷がすべて確定しているため、残りのマスは安全です。",
		flag: "数字の周囲に追加で置く地雷はありません。",
	},
	"all-unknown-are-mines": {
		reveal: "数字の周囲に安全と確定できるマスはありません。",
		flag: "残りの地雷数と未確定マス数が一致するため、すべて地雷です。",
	},
	"subset-difference": {
		reveal:
			"2つの数字が作る候補集合を比較すると、差分のマスには地雷が残らないため安全です。",
		flag: "2つの数字が作る候補集合を比較すると、差分のマスはすべて地雷です。",
	},
	"global-mine-count": {
		reveal:
			"盤面全体の地雷がすべて確定しているため、残りの未確定マスは安全です。",
		flag: "盤面全体の残り地雷数と未確定マス数が一致するため、残りはすべて地雷です。",
	},
	"constraint-enumeration": {
		reveal:
			"公開済みの数字を満たすすべての配置で地雷にならないため、このマスは安全です。",
		flag: "公開済みの数字を満たすすべての配置で地雷になるため、このマスは地雷です。",
	},
};

class SeededRandom {
	private state: number;

	constructor(seed: string) {
		this.state = hashSeed(seed);
	}

	next() {
		this.state += 0x6d2b79f5;
		let value = this.state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	}

	int(min: number, max: number) {
		return min + Math.floor(this.next() * (max - min));
	}

	shuffle<T>(values: T[]) {
		const result = [...values];
		for (let index = result.length - 1; index > 0; index -= 1) {
			const nextIndex = this.int(0, index + 1);
			[result[index], result[nextIndex]] = [result[nextIndex], result[index]];
		}
		return result;
	}
}

function hashSeed(seed: string) {
	let hash = 2166136261;
	for (let index = 0; index < seed.length; index += 1) {
		hash ^= seed.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	hash ^= hash >>> 16;
	hash = Math.imul(hash, 2246822507);
	hash ^= hash >>> 13;
	hash = Math.imul(hash, 3266489909);
	hash ^= hash >>> 16;
	return hash >>> 0 || 0x6d2b79f5;
}

export function createRandomSeed() {
	if (globalThis.crypto?.getRandomValues) {
		const values = new Uint32Array(3);
		globalThis.crypto.getRandomValues(values);
		return [...values]
			.map((value) => value.toString(16).padStart(8, "0"))
			.join("");
	}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

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
			cell.adjacentMines = getNeighborIndices(
				indexOf(cell),
				width,
				height,
			).filter((index) => mines.has(index)).length;
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
		maxRule: "remaining-mines-zero",
		solutionSteps: [],
	};
}

function indexOf(cell: BoardCell) {
	return cell.index;
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

function uniqueSorted(values: Iterable<number>) {
	return [...new Set(values)].sort((left, right) => left - right);
}

function constraintKey(constraint: Constraint) {
	return `${constraint.variables.join(",")}=${constraint.remainingMines}`;
}

function buildConstraints(
	board: LogicalBoard,
	revealed: Set<number>,
	flagged: Set<number>,
) {
	const constraints = new Map<string, Constraint>();
	let contradiction = false;
	for (const source of revealed) {
		const cell = board.cells[source];
		if (!cell || cell.mine) {
			contradiction = true;
			continue;
		}
		const neighbors = getNeighborIndices(source, board.width, board.height);
		const flaggedNeighbors = neighbors.filter((index) => flagged.has(index));
		const variables = neighbors.filter(
			(index) => !revealed.has(index) && !flagged.has(index),
		);
		const remainingMines = cell.adjacentMines - flaggedNeighbors.length;
		if (remainingMines < 0 || remainingMines > variables.length) {
			contradiction = true;
			continue;
		}
		if (variables.length === 0) continue;
		const constraint = {
			variables: uniqueSorted(variables),
			remainingMines,
			sources: [source],
		};
		const key = constraintKey(constraint);
		const existing = constraints.get(key);
		if (existing) {
			existing.sources = uniqueSorted([...existing.sources, source]);
		} else {
			constraints.set(key, constraint);
		}
	}
	return { constraints: [...constraints.values()], contradiction };
}

function makeDeduction(
	action: "reveal" | "flag",
	targets: Iterable<number>,
	sources: Iterable<number>,
	rule: DeductionRule,
): Deduction {
	return {
		action,
		targets: uniqueSorted(targets),
		sources: uniqueSorted(sources),
		rule,
		explanation: explanations[rule][action],
	};
}

function isSubset(subset: number[], superset: number[]) {
	const values = new Set(superset);
	return subset.every((value) => values.has(value));
}

function deduceBySubset(constraints: Constraint[]) {
	const expanded = constraints.map((constraint) => ({
		...constraint,
		variables: [...constraint.variables],
		sources: [...constraint.sources],
	}));
	const known = new Set(expanded.map(constraintKey));
	for (let pass = 0; pass < 80; pass += 1) {
		let added = false;
		const snapshot = [...expanded];
		for (const smaller of snapshot) {
			for (const larger of snapshot) {
				if (
					smaller === larger ||
					smaller.variables.length >= larger.variables.length ||
					!isSubset(smaller.variables, larger.variables)
				) {
					continue;
				}
				const smallValues = new Set(smaller.variables);
				const difference = larger.variables.filter(
					(value) => !smallValues.has(value),
				);
				const remaining = larger.remainingMines - smaller.remainingMines;
				if (remaining < 0 || remaining > difference.length) {
					return { deduction: null, contradiction: true };
				}
				const sources = uniqueSorted([...smaller.sources, ...larger.sources]);
				if (remaining === 0) {
					return {
						deduction: makeDeduction(
							"reveal",
							difference,
							sources,
							"subset-difference",
						),
						contradiction: false,
					};
				}
				if (remaining === difference.length) {
					return {
						deduction: makeDeduction(
							"flag",
							difference,
							sources,
							"subset-difference",
						),
						contradiction: false,
					};
				}
				const derived = {
					variables: difference,
					remainingMines: remaining,
					sources,
				};
				const key = constraintKey(derived);
				if (!known.has(key)) {
					known.add(key);
					expanded.push(derived);
					added = true;
				}
			}
		}
		if (!added) break;
	}
	return { deduction: null, contradiction: false };
}

function getConstraintComponents(constraints: Constraint[]) {
	const byVariable = new Map<number, number[]>();
	constraints.forEach((constraint, constraintIndex) => {
		for (const variable of constraint.variables) {
			const indices = byVariable.get(variable) ?? [];
			indices.push(constraintIndex);
			byVariable.set(variable, indices);
		}
	});
	const visited = new Set<number>();
	const components: Array<{
		variables: number[];
		constraints: Constraint[];
	}> = [];
	for (const startingVariable of [...byVariable.keys()].sort(
		(left, right) => left - right,
	)) {
		if (visited.has(startingVariable)) continue;
		const queue = [startingVariable];
		const variables = new Set<number>();
		const constraintIndices = new Set<number>();
		for (let cursor = 0; cursor < queue.length; cursor += 1) {
			const variable = queue[cursor];
			if (visited.has(variable)) continue;
			visited.add(variable);
			variables.add(variable);
			for (const constraintIndex of byVariable.get(variable) ?? []) {
				constraintIndices.add(constraintIndex);
				for (const neighbor of constraints[constraintIndex].variables) {
					if (!visited.has(neighbor)) queue.push(neighbor);
				}
			}
		}
		components.push({
			variables: uniqueSorted(variables),
			constraints: [...constraintIndices]
				.sort((left, right) => left - right)
				.map((index) => constraints[index]),
		});
	}
	return components;
}

function enumerateComponent(
	variables: number[],
	constraints: Constraint[],
	maxVariables: number,
) {
	if (variables.length > maxVariables) return null;
	const positions = new Map(
		variables.map((variable, index) => [variable, index]),
	);
	const mappedConstraints = constraints.map((constraint) => ({
		positions: constraint.variables.map(
			(variable) => positions.get(variable) ?? 0,
		),
		remainingMines: constraint.remainingMines,
	}));
	const assignments = new Int8Array(variables.length);
	assignments.fill(-1);
	const mineTotals = new Uint32Array(variables.length);
	let solutionCount = 0;
	let visitedNodes = 0;
	const visit = (position: number) => {
		visitedNodes += 1;
		if (visitedNodes > 300_000) return;
		if (position === variables.length) {
			solutionCount += 1;
			for (let index = 0; index < assignments.length; index += 1) {
				if (assignments[index] === 1) mineTotals[index] += 1;
			}
			return;
		}
		for (const value of [0, 1]) {
			assignments[position] = value;
			let valid = true;
			for (const constraint of mappedConstraints) {
				let assignedMines = 0;
				let unknown = 0;
				for (const index of constraint.positions) {
					if (assignments[index] === -1) unknown += 1;
					else assignedMines += assignments[index];
				}
				if (
					assignedMines > constraint.remainingMines ||
					assignedMines + unknown < constraint.remainingMines
				) {
					valid = false;
					break;
				}
			}
			if (valid) visit(position + 1);
		}
		assignments[position] = -1;
	};
	visit(0);
	if (visitedNodes > 300_000) return null;
	return {
		solutionCount,
		safe: variables.filter((_, index) => mineTotals[index] === 0),
		mines: variables.filter((_, index) => mineTotals[index] === solutionCount),
	};
}

function findDeduction(
	board: LogicalBoard,
	revealed: Set<number>,
	flagged: Set<number>,
	maxEnumerationVariables = 16,
): DeductionResult {
	const { constraints, contradiction } = buildConstraints(
		board,
		revealed,
		flagged,
	);
	if (contradiction) {
		return { deduction: null, contradiction: true, maxConstraintSize: 0 };
	}
	const safeTargets: number[] = [];
	const safeSources: number[] = [];
	const mineTargets: number[] = [];
	const mineSources: number[] = [];
	for (const constraint of constraints) {
		if (constraint.remainingMines === 0) {
			safeTargets.push(...constraint.variables);
			safeSources.push(...constraint.sources);
		}
		if (constraint.remainingMines === constraint.variables.length) {
			mineTargets.push(...constraint.variables);
			mineSources.push(...constraint.sources);
		}
	}
	if (safeTargets.length > 0) {
		return {
			deduction: makeDeduction(
				"reveal",
				safeTargets,
				safeSources,
				"remaining-mines-zero",
			),
			contradiction: false,
			maxConstraintSize: 0,
		};
	}
	if (mineTargets.length > 0) {
		return {
			deduction: makeDeduction(
				"flag",
				mineTargets,
				mineSources,
				"all-unknown-are-mines",
			),
			contradiction: false,
			maxConstraintSize: 0,
		};
	}
	const subset = deduceBySubset(constraints);
	if (subset.contradiction || subset.deduction) {
		return {
			...subset,
			maxConstraintSize: 0,
		};
	}
	const unresolved = board.cells
		.map((cell) => cell.index)
		.filter((index) => !revealed.has(index) && !flagged.has(index));
	const remainingMines = board.mineCount - flagged.size;
	if (remainingMines < 0 || remainingMines > unresolved.length) {
		return { deduction: null, contradiction: true, maxConstraintSize: 0 };
	}
	if (remainingMines === 0 && unresolved.length > 0) {
		return {
			deduction: makeDeduction("reveal", unresolved, [], "global-mine-count"),
			contradiction: false,
			maxConstraintSize: 0,
		};
	}
	if (remainingMines === unresolved.length && unresolved.length > 0) {
		return {
			deduction: makeDeduction("flag", unresolved, [], "global-mine-count"),
			contradiction: false,
			maxConstraintSize: 0,
		};
	}
	let maxConstraintSize = 0;
	for (const component of getConstraintComponents(constraints)) {
		maxConstraintSize = Math.max(maxConstraintSize, component.variables.length);
		const result = enumerateComponent(
			component.variables,
			component.constraints,
			maxEnumerationVariables,
		);
		if (!result) continue;
		if (result.solutionCount === 0) {
			return { deduction: null, contradiction: true, maxConstraintSize };
		}
		const sources = component.constraints.flatMap(
			(constraint) => constraint.sources,
		);
		if (result.safe.length > 0) {
			return {
				deduction: makeDeduction(
					"reveal",
					result.safe,
					sources,
					"constraint-enumeration",
				),
				contradiction: false,
				maxConstraintSize,
			};
		}
		if (result.mines.length > 0) {
			return {
				deduction: makeDeduction(
					"flag",
					result.mines,
					sources,
					"constraint-enumeration",
				),
				contradiction: false,
				maxConstraintSize,
			};
		}
	}
	return { deduction: null, contradiction: false, maxConstraintSize };
}

function solveBoard(board: LogicalBoard): SolverResult {
	const revealed = new Set(getOpeningCells(board, board.firstIndex));
	const flagged = new Set<number>();
	const steps: Deduction[] = [];
	let contradiction = false;
	let maxRuleCost = 0;
	let subsetCount = 0;
	let enumerationCount = 0;
	for (let iteration = 0; iteration < board.cells.length * 4; iteration += 1) {
		if (revealed.size === board.cells.length - board.mineCount) break;
		const result = findDeduction(board, revealed, flagged);
		if (result.contradiction) {
			contradiction = true;
			break;
		}
		const deduction = result.deduction;
		if (!deduction) break;
		const freshTargets = deduction.targets.filter(
			(index) => !revealed.has(index) && !flagged.has(index),
		);
		if (freshTargets.length === 0) break;
		const applied = { ...deduction, targets: freshTargets };
		if (
			freshTargets.some((index) =>
				deduction.action === "reveal"
					? board.cells[index].mine
					: !board.cells[index].mine,
			)
		) {
			contradiction = true;
			break;
		}
		steps.push(applied);
		maxRuleCost = Math.max(maxRuleCost, ruleCosts[deduction.rule]);
		if (deduction.rule === "subset-difference") subsetCount += 1;
		if (deduction.rule === "constraint-enumeration") enumerationCount += 1;
		if (deduction.action === "flag") {
			for (const index of freshTargets) flagged.add(index);
		} else {
			for (const index of freshTargets) {
				for (const opened of getOpeningCells(board, index, flagged)) {
					revealed.add(opened);
				}
			}
		}
	}
	return {
		solved: revealed.size === board.cells.length - board.mineCount,
		contradiction,
		steps,
		maxRuleCost,
		subsetCount,
		enumerationCount,
	};
}

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
	const mines = random.shuffle(candidates).slice(0, options.mineCount);
	return createBoardFromMines(
		options.width,
		options.height,
		mines,
		firstIndex,
		seed,
	);
}

function scoreSolution(result: SolverResult) {
	return (
		result.maxRuleCost * 8 +
		result.subsetCount * 3 +
		result.enumerationCount * 10 +
		Math.min(result.steps.length, 40)
	);
}

function solutionMatchesDifficulty(
	result: SolverResult,
	difficulty: DifficultyKey,
) {
	switch (difficulty) {
		case "beginner":
			return result.maxRuleCost <= 1;
		case "intermediate":
			return (
				result.subsetCount > 0 &&
				result.enumerationCount === 0 &&
				result.maxRuleCost <= 3
			);
		case "advanced":
			return (
				result.subsetCount > 0 &&
				result.enumerationCount === 0 &&
				scoreSolution(result) >= 35
			);
		case "expert":
			return result.enumerationCount > 0;
	}
}

function difficultyDistance(result: SolverResult, difficulty: DifficultyKey) {
	const score = scoreSolution(result);
	const target = {
		beginner: 12,
		intermediate: 34,
		advanced: 58,
		expert: 92,
	}[difficulty];
	const enumerationPenalty =
		difficulty === "expert"
			? result.enumerationCount === 0
				? 45
				: 0
			: result.enumerationCount > 0
				? 30
				: 0;
	return Math.abs(score - target) + enumerationPenalty;
}

function defaultAttemptCount(difficulty: DifficultyKey) {
	return {
		beginner: 180,
		intermediate: 240,
		advanced: 320,
		expert: 420,
	}[difficulty];
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
	let best:
		| { board: LogicalBoard; result: SolverResult; distance: number }
		| undefined;
	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		const seed = attempt === 0 ? baseSeed : `${baseSeed}:${attempt}`;
		const board = createCandidate(options, seed);
		const result = solveBoard(board);
		if (!result.solved || result.contradiction) continue;
		const distance = difficultyDistance(result, options.difficulty);
		if (!best || distance < best.distance) {
			best = { board, result, distance };
		}
		if (solutionMatchesDifficulty(result, options.difficulty)) {
			best = { board, result, distance };
			break;
		}
	}
	if (!best) {
		throw new Error(
			"論理だけで解ける盤面を生成できませんでした。もう一度お試しください。",
		);
	}
	const maxRule = (Object.entries(ruleCosts) as Array<[DeductionRule, number]>)
		.filter(([, cost]) => cost <= best.result.maxRuleCost)
		.sort((left, right) => right[1] - left[1])[0]?.[0];
	return {
		...best.board,
		difficultyScore: scoreSolution(best.result),
		maxRule: maxRule ?? "remaining-mines-zero",
		solutionSteps: best.result.steps,
	};
}

export function getLogicalHint(
	board: LogicalBoard,
	revealed: Set<number>,
	playerFlags: Set<number>,
) {
	const verifiedFlags = new Set<number>();
	for (let iteration = 0; iteration <= board.mineCount; iteration += 1) {
		const result = findDeduction(board, revealed, verifiedFlags);
		if (result.contradiction || !result.deduction) return null;
		const deduction = result.deduction;
		if (deduction.action === "reveal") {
			const incorrectFlags = deduction.targets.filter((index) =>
				playerFlags.has(index),
			);
			if (incorrectFlags.length > 0) {
				return {
					...deduction,
					action: "unflag" as const,
					targets: incorrectFlags,
					explanation: `${deduction.explanation} このマスの旗を外してください。`,
				};
			}
			return deduction;
		}
		const unresolvedMines = deduction.targets.filter(
			(index) => !playerFlags.has(index),
		);
		if (unresolvedMines.length > 0) {
			return { ...deduction, targets: unresolvedMines };
		}
		let added = false;
		for (const index of deduction.targets) {
			if (!verifiedFlags.has(index)) {
				verifiedFlags.add(index);
				added = true;
			}
		}
		if (!added) return null;
	}
	return null;
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
		hintTarget: boolean;
		hintSource: boolean;
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
		options.hintTarget ? "ヒント対象" : "",
		options.hintSource ? "ヒントの根拠" : "",
	].filter(Boolean);
	return [`${row}行 ${column}列`, state, ...annotations].join("、");
}
