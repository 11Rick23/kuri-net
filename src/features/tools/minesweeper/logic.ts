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
	beginner: { label: "初級", width: 9, height: 9, mineCount: 10 },
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

export type DeductionAction = "reveal" | "flag";

export type Deduction = {
	action: DeductionAction;
	targets: number[];
	sources: number[];
	rule: DeductionRule;
	explanation: string;
	constraintSize?: number;
};

export type DifficultyFeatures = {
	maxRuleCost: number;
	subsetCount: number;
	enumerationCount: number;
	maxSourceCount: number;
	maxConstraintSize: number;
	maxEnumerationConstraintSize: number;
	maxHardStepStreak: number;
	maxHardStepsInWindow: number;
	scarceStepRatio: number;
	basicStepRatio: number;
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
	difficultyFeatures: DifficultyFeatures;
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
	progress: number;
	features: DifficultyFeatures;
};

type EvaluatedCandidate = {
	board: LogicalBoard;
	result: SolverResult;
	distance: number;
};

type MineMutation = "move" | "add" | "remove";

const ruleCosts: Record<DeductionRule, number> = {
	"remaining-mines-zero": 1,
	"all-unknown-are-mines": 1,
	"subset-difference": 3,
	"global-mine-count": 5,
	"constraint-enumeration": 8,
};

const emptyDifficultyFeatures: DifficultyFeatures = {
	maxRuleCost: 0,
	subsetCount: 0,
	enumerationCount: 0,
	maxSourceCount: 0,
	maxConstraintSize: 0,
	maxEnumerationConstraintSize: 0,
	maxHardStepStreak: 0,
	maxHardStepsInWindow: 0,
	scarceStepRatio: 0,
	basicStepRatio: 1,
};

export const ruleLabels: Record<DeductionRule, string> = {
	"remaining-mines-zero": "基本推測",
	"all-unknown-are-mines": "基本推測",
	"subset-difference": "集合差推測",
	"global-mine-count": "地雷数推測",
	"constraint-enumeration": "制約列挙推測",
};

const explanations: Record<DeductionRule, string> = {
	"remaining-mines-zero": "周囲の地雷の数を確認してみましょう。",
	"all-unknown-are-mines": "周囲の未確定マス数を確認してみましょう。",
	"subset-difference":
		"強調されたマスの共通部分に含まれる地雷数を確認してみましょう。",
	"global-mine-count": "未発見の地雷の数と未確定マス数を比べてみましょう。",
	"constraint-enumeration":
		"強調されたマスの条件を同時に満たす配置を考えてみましょう。",
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

function createBoardFromMines(
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
		difficultyFeatures: { ...emptyDifficultyFeatures },
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
		explanation: explanations[rule],
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
	const maxConstraintSize = constraints.reduce(
		(maximum, constraint) => Math.max(maximum, constraint.variables.length),
		0,
	);
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
			maxConstraintSize,
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
			maxConstraintSize,
		};
	}
	const subset = deduceBySubset(constraints);
	if (subset.contradiction || subset.deduction) {
		return {
			...subset,
			maxConstraintSize,
		};
	}
	const unresolved = board.cells
		.map((cell) => cell.index)
		.filter((index) => !revealed.has(index) && !flagged.has(index));
	const remainingMines = board.mineCount - flagged.size;
	if (remainingMines < 0 || remainingMines > unresolved.length) {
		return { deduction: null, contradiction: true, maxConstraintSize };
	}
	if (remainingMines === 0 && unresolved.length > 0) {
		return {
			deduction: makeDeduction("reveal", unresolved, [], "global-mine-count"),
			contradiction: false,
			maxConstraintSize,
		};
	}
	if (remainingMines === unresolved.length && unresolved.length > 0) {
		return {
			deduction: makeDeduction("flag", unresolved, [], "global-mine-count"),
			contradiction: false,
			maxConstraintSize,
		};
	}
	for (const component of getConstraintComponents(constraints)) {
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
				deduction: {
					...makeDeduction(
						"reveal",
						result.safe,
						sources,
						"constraint-enumeration",
					),
					constraintSize: component.variables.length,
				},
				contradiction: false,
				maxConstraintSize,
			};
		}
		if (result.mines.length > 0) {
			return {
				deduction: {
					...makeDeduction(
						"flag",
						result.mines,
						sources,
						"constraint-enumeration",
					),
					constraintSize: component.variables.length,
				},
				contradiction: false,
				maxConstraintSize,
			};
		}
	}
	return { deduction: null, contradiction: false, maxConstraintSize };
}

export function getLogicalHint(
	board: LogicalBoard,
	revealed: Set<number>,
	flagged: Set<number>,
) {
	const result = findDeduction(board, revealed, flagged);
	if (!result.deduction || result.contradiction) return null;

	if (
		result.deduction.rule !== "remaining-mines-zero" &&
		result.deduction.rule !== "all-unknown-are-mines"
	) {
		return result.deduction;
	}

	const { constraints, contradiction } = buildConstraints(
		board,
		revealed,
		flagged,
	);
	if (contradiction) return null;
	const matchingConstraint = constraints.find((constraint) =>
		result.deduction?.rule === "remaining-mines-zero"
			? constraint.remainingMines === 0
			: constraint.remainingMines === constraint.variables.length,
	);
	if (!matchingConstraint) return null;

	return makeDeduction(
		result.deduction.action,
		matchingConstraint.variables,
		matchingConstraint.sources.slice(0, 1),
		result.deduction.rule,
	);
}

function collectDifficultyFeatures(
	steps: Deduction[],
	maxConstraintSize: number,
): DifficultyFeatures {
	if (steps.length === 0) {
		return { ...emptyDifficultyFeatures, maxConstraintSize };
	}
	const isHardStep = (step: Deduction) =>
		step.rule === "subset-difference" || step.rule === "constraint-enumeration";
	let hardStreak = 0;
	let maxHardStepStreak = 0;
	for (const step of steps) {
		if (isHardStep(step)) {
			hardStreak += 1;
			maxHardStepStreak = Math.max(maxHardStepStreak, hardStreak);
		} else {
			hardStreak = 0;
		}
	}
	let maxHardStepsInWindow = 0;
	for (let index = 0; index < steps.length; index += 1) {
		maxHardStepsInWindow = Math.max(
			maxHardStepsInWindow,
			steps.slice(index, index + 5).filter((step) => isHardStep(step)).length,
		);
	}
	const basicStepCount = steps.filter(
		(step) =>
			step.rule === "remaining-mines-zero" ||
			step.rule === "all-unknown-are-mines",
	).length;
	return {
		maxRuleCost: Math.max(...steps.map((step) => ruleCosts[step.rule])),
		subsetCount: steps.filter((step) => step.rule === "subset-difference")
			.length,
		enumerationCount: steps.filter(
			(step) => step.rule === "constraint-enumeration",
		).length,
		maxSourceCount: Math.max(...steps.map((step) => step.sources.length)),
		maxConstraintSize,
		maxEnumerationConstraintSize: Math.max(
			0,
			...steps
				.filter((step) => step.rule === "constraint-enumeration")
				.map((step) => step.constraintSize ?? 0),
		),
		maxHardStepStreak,
		maxHardStepsInWindow,
		scarceStepRatio:
			steps.filter((step) => step.targets.length <= 2).length / steps.length,
		basicStepRatio: basicStepCount / steps.length,
	};
}

function solveBoard(board: LogicalBoard): SolverResult {
	const revealed = new Set(getOpeningCells(board, board.firstIndex));
	const flagged = new Set<number>();
	const steps: Deduction[] = [];
	let contradiction = false;
	let maxConstraintSize = 0;
	for (let iteration = 0; iteration < board.cells.length * 4; iteration += 1) {
		if (revealed.size === board.cells.length - board.mineCount) break;
		const result = findDeduction(board, revealed, flagged);
		maxConstraintSize = Math.max(maxConstraintSize, result.maxConstraintSize);
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
	const safeCellCount = board.cells.length - board.mineCount;
	return {
		solved: revealed.size === safeCellCount,
		contradiction,
		steps,
		progress: safeCellCount > 0 ? revealed.size / safeCellCount : 0,
		features: collectDifficultyFeatures(steps, maxConstraintSize),
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

function scoreSolution(result: SolverResult) {
	const features = result.features;
	return Math.round(
		features.maxRuleCost * 10 +
			features.subsetCount * 4 +
			features.enumerationCount * 12 +
			features.maxSourceCount * 0.5 +
			Math.min(features.maxConstraintSize, 12) * 0.5 +
			features.maxEnumerationConstraintSize * 2 +
			features.maxHardStepStreak * 6 +
			features.maxHardStepsInWindow * 4 +
			features.scarceStepRatio * 10 +
			(1 - features.basicStepRatio) * 10 +
			Math.min(result.steps.length, 40) * 0.25,
	);
}

export function difficultyFeaturesMatchDefinition(
	features: DifficultyFeatures,
	difficulty: DifficultyKey,
) {
	switch (difficulty) {
		case "beginner":
			return (
				features.maxRuleCost <= 1 &&
				features.subsetCount === 0 &&
				features.enumerationCount === 0
			);
		case "intermediate":
			return (
				features.subsetCount >= 1 &&
				features.subsetCount <= 3 &&
				features.enumerationCount === 0 &&
				features.maxRuleCost <= 3
			);
		case "advanced":
			return (
				features.subsetCount >= 4 &&
				features.enumerationCount === 0 &&
				features.maxRuleCost <= 3 &&
				features.maxHardStepStreak >= 2 &&
				features.maxHardStepsInWindow >= 2 &&
				features.scarceStepRatio >= 0.4
			);
		case "expert":
			return (
				features.enumerationCount > 0 &&
				features.maxEnumerationConstraintSize >= 8
			);
	}
}

function solutionMatchesDifficulty(
	result: SolverResult,
	difficulty: DifficultyKey,
) {
	return (
		result.solved &&
		!result.contradiction &&
		result.steps.length > 0 &&
		difficultyFeaturesMatchDefinition(result.features, difficulty)
	);
}

function difficultyDistance(
	result: SolverResult,
	difficulty: DifficultyKey,
	mineCount: number,
	requestedMineCount: number,
) {
	if (result.contradiction) return 10_000;
	const features = result.features;
	const score = scoreSolution(result);
	const unsolvedPenalty = result.solved
		? 0
		: 1_000 + Math.round((1 - result.progress) * 500);
	const mineCountPenalty = Math.abs(mineCount - requestedMineCount) * 0.25;
	let profilePenalty = 0;
	switch (difficulty) {
		case "beginner":
			profilePenalty =
				features.subsetCount * 120 +
				features.enumerationCount * 240 +
				Math.max(0, features.maxRuleCost - 1) * 80 +
				Math.abs(score - 24) * 0.05;
			break;
		case "intermediate":
			profilePenalty =
				(features.subsetCount === 0 ? 140 : 0) +
				Math.max(0, features.subsetCount - 3) * 45 +
				features.enumerationCount * 220 +
				Math.max(0, features.maxRuleCost - 3) * 80 +
				Math.abs(features.subsetCount - 2) * 8 +
				Math.abs(score - 58) * 0.05;
			break;
		case "advanced":
			profilePenalty =
				Math.max(0, 4 - features.subsetCount) * 45 +
				features.enumerationCount * 240 +
				Math.max(0, features.maxRuleCost - 3) * 100 +
				Math.max(0, 2 - features.maxHardStepStreak) * 55 +
				Math.max(0, 2 - features.maxHardStepsInWindow) * 25 +
				Math.max(0, 0.4 - features.scarceStepRatio) * 180 +
				Math.abs(features.subsetCount - 6) * 2 +
				Math.abs(score - 92) * 0.05;
			break;
		case "expert":
			profilePenalty =
				(features.enumerationCount === 0 ? 280 : 0) +
				Math.max(0, 8 - features.maxEnumerationConstraintSize) * 45 +
				Math.abs(score - 145) * 0.05;
			break;
	}
	return unsolvedPenalty + profilePenalty + mineCountPenalty;
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
		difficultyScore: scoreSolution(candidate.result),
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

function buildRevealedCellConstraints(
	board: LogicalBoard,
	revealed: Set<number>,
) {
	const constraints = new Map<string, Constraint>();
	let contradiction = false;
	for (const source of revealed) {
		const cell = board.cells[source];
		if (!cell || cell.mine) {
			contradiction = true;
			continue;
		}
		const variables = getNeighborIndices(
			source,
			board.width,
			board.height,
		).filter((index) => !revealed.has(index));
		if (cell.adjacentMines < 0 || cell.adjacentMines > variables.length) {
			contradiction = true;
			continue;
		}
		if (variables.length === 0) continue;
		const constraint = {
			variables: uniqueSorted(variables),
			remainingMines: cell.adjacentMines,
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

function orderConstraintVariables(
	constraints: Constraint[],
	targetIndex: number,
) {
	const components = getConstraintComponents(constraints);
	const targetComponentIndex = components.findIndex((component) =>
		component.variables.includes(targetIndex),
	);
	if (targetComponentIndex > 0) {
		const [targetComponent] = components.splice(targetComponentIndex, 1);
		components.unshift(targetComponent);
	}
	const constraintCountByVariable = new Map<number, number>();
	for (const constraint of constraints) {
		for (const variable of constraint.variables) {
			constraintCountByVariable.set(
				variable,
				(constraintCountByVariable.get(variable) ?? 0) + 1,
			);
		}
	}
	return components.flatMap((component) =>
		[...component.variables].sort((left, right) => {
			if (left === targetIndex) return -1;
			if (right === targetIndex) return 1;
			return (
				(constraintCountByVariable.get(right) ?? 0) -
					(constraintCountByVariable.get(left) ?? 0) || left - right
			);
		}),
	);
}

/**
 * Returns a board that preserves every revealed clue while making the attempted
 * cell a mine. A null result proves that the cell is safe in every placement
 * satisfying the revealed clues and the board's total mine count.
 */
export function createForcedMineBoard(
	board: LogicalBoard,
	revealed: Set<number>,
	targetIndex: number,
) {
	if (
		!board.cells[targetIndex] ||
		revealed.has(targetIndex) ||
		board.mineCount < 1
	) {
		return null;
	}
	const { constraints, contradiction } = buildRevealedCellConstraints(
		board,
		revealed,
	);
	if (contradiction) return null;

	const frontier = new Set(
		constraints.flatMap((constraint) => constraint.variables),
	);
	const variables = orderConstraintVariables(constraints, targetIndex);
	const freeCells = board.cells
		.map((cell) => cell.index)
		.filter((index) => !revealed.has(index) && !frontier.has(index));
	const targetIsFree = freeCells.includes(targetIndex);
	const minimumFreeMines = targetIsFree ? 1 : 0;
	const currentMines = new Set(
		board.cells.filter((cell) => cell.mine).map((cell) => cell.index),
	);
	const constraintsByVariable = new Map<number, number[]>();
	constraints.forEach((constraint, constraintIndex) => {
		for (const variable of constraint.variables) {
			const related = constraintsByVariable.get(variable) ?? [];
			related.push(constraintIndex);
			constraintsByVariable.set(variable, related);
		}
	});
	const assignedMines = new Uint16Array(constraints.length);
	const unknownCounts = new Uint16Array(
		constraints.map((constraint) => constraint.variables.length),
	);
	const assignments = new Int8Array(variables.length);
	assignments.fill(-1);
	let forcedMines: number[] = [];

	const visit = (position: number, frontierMineCount: number): boolean => {
		const remainingFrontier = variables.length - position;
		if (
			frontierMineCount + minimumFreeMines > board.mineCount ||
			frontierMineCount + remainingFrontier + freeCells.length < board.mineCount
		) {
			return false;
		}
		if (position === variables.length) {
			const requiredFreeMines = board.mineCount - frontierMineCount;
			if (
				requiredFreeMines < minimumFreeMines ||
				requiredFreeMines > freeCells.length
			) {
				return false;
			}
			const selectedFreeMines: number[] = [];
			if (targetIsFree) selectedFreeMines.push(targetIndex);
			for (const index of freeCells) {
				if (
					selectedFreeMines.length >= requiredFreeMines ||
					index === targetIndex ||
					!currentMines.has(index)
				) {
					continue;
				}
				selectedFreeMines.push(index);
			}
			for (const index of freeCells) {
				if (
					selectedFreeMines.length >= requiredFreeMines ||
					selectedFreeMines.includes(index)
				) {
					continue;
				}
				selectedFreeMines.push(index);
			}
			forcedMines = [
				...variables.filter((_, index) => assignments[index] === 1),
				...selectedFreeMines,
			];
			return true;
		}

		const variable = variables[position];
		const values =
			variable === targetIndex
				? [1]
				: currentMines.has(variable)
					? [1, 0]
					: [0, 1];
		for (const value of values) {
			assignments[position] = value;
			let valid = true;
			for (const constraintIndex of constraintsByVariable.get(variable) ?? []) {
				unknownCounts[constraintIndex] -= 1;
				assignedMines[constraintIndex] += value;
				const required = constraints[constraintIndex].remainingMines;
				if (
					assignedMines[constraintIndex] > required ||
					assignedMines[constraintIndex] + unknownCounts[constraintIndex] <
						required
				) {
					valid = false;
				}
			}
			if (valid && visit(position + 1, frontierMineCount + value)) {
				return true;
			}
			for (const constraintIndex of constraintsByVariable.get(variable) ?? []) {
				assignedMines[constraintIndex] -= value;
				unknownCounts[constraintIndex] += 1;
			}
		}
		assignments[position] = -1;
		return false;
	};

	if (!visit(0, 0) || !forcedMines.includes(targetIndex)) return null;
	const rearranged = createBoardFromMines(
		board.width,
		board.height,
		forcedMines,
		board.firstIndex,
		board.seed,
	);
	return {
		...rearranged,
		difficultyScore: board.difficultyScore,
		difficultyFeatures: board.difficultyFeatures,
		maxRule: board.maxRule,
		solutionSteps: [],
	};
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
