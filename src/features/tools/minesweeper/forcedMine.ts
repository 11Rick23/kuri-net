import {
	createBoardFromMines,
	getNeighborIndices,
} from "@/features/tools/minesweeper/board";
import {
	type Constraint,
	constraintKey,
	getConstraintComponents,
	uniqueSorted,
} from "@/features/tools/minesweeper/constraints";
import type { LogicalBoard } from "@/features/tools/minesweeper/model";

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
