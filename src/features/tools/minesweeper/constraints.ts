export type Constraint = {
	variables: number[];
	remainingMines: number;
	sources: number[];
};

export function uniqueSorted(values: Iterable<number>) {
	return [...new Set(values)].sort((left, right) => left - right);
}

export function constraintKey(constraint: Constraint) {
	return `${constraint.variables.join(",")}=${constraint.remainingMines}`;
}

export function getConstraintComponents(constraints: Constraint[]) {
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
