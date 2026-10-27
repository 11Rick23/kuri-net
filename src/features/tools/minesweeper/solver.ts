import {
	getNeighborIndices,
	getOpeningCells,
} from "@/features/tools/minesweeper/board";
import {
	type Constraint,
	constraintKey,
	getConstraintComponents,
	uniqueSorted,
} from "@/features/tools/minesweeper/constraints";
import {
	type Deduction,
	type DeductionRule,
	type DifficultyFeatures,
	deductionExplanations,
	emptyDifficultyFeatures,
	type LogicalBoard,
	ruleCosts,
	type SolverResult,
} from "@/features/tools/minesweeper/model";

type DeductionResult = {
	deduction: Deduction | null;
	contradiction: boolean;
	maxConstraintSize: number;
};

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
		explanation: deductionExplanations[rule],
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
		return { ...subset, maxConstraintSize };
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
	const subsetCount = steps.filter(
		(step) => step.rule === "subset-difference",
	).length;
	const enumerationCount = steps.filter(
		(step) => step.rule === "constraint-enumeration",
	).length;
	const hardStepCount = steps.filter((step) => isHardStep(step)).length;
	return {
		maxRuleCost: Math.max(...steps.map((step) => ruleCosts[step.rule])),
		averageRuleCost:
			steps.reduce((total, step) => total + ruleCosts[step.rule], 0) /
			steps.length,
		subsetCount,
		subsetRatio: subsetCount / steps.length,
		enumerationCount,
		enumerationRatio: enumerationCount / steps.length,
		hardStepRatio: hardStepCount / steps.length,
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

export function solveBoard(board: LogicalBoard): SolverResult {
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
