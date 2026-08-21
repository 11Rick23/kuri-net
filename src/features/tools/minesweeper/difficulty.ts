import {
	type Deduction,
	type DifficultyFeatures,
	type DifficultyKey,
	ruleCosts,
	type SolverResult,
} from "@/features/tools/minesweeper/model";

/** Returns the average deduction cost on a 100–800 scale. */
export function calculateAverageDifficultyScore(steps: Deduction[]) {
	if (steps.length === 0) return 0;
	const averageRuleCost =
		steps.reduce((total, step) => total + ruleCosts[step.rule], 0) /
		steps.length;
	return Math.round(averageRuleCost * 1_000) / 10;
}

export function difficultyFeaturesMatchDefinition(
	features: DifficultyFeatures,
	difficulty: DifficultyKey,
) {
	switch (difficulty) {
		case "beginner":
			return (
				features.averageRuleCost >= 1.08 &&
				features.averageRuleCost < 1.2 &&
				features.subsetRatio >= 0.04 &&
				features.subsetRatio < 0.1 &&
				features.enumerationRatio === 0 &&
				features.maxRuleCost <= 3
			);
		case "intermediate":
			return (
				features.averageRuleCost >= 1.2 &&
				features.averageRuleCost < 1.35 &&
				features.subsetRatio >= 0.1 &&
				features.subsetRatio < 0.175 &&
				features.enumerationRatio === 0 &&
				features.maxRuleCost <= 3
			);
		case "advanced":
			return (
				features.averageRuleCost >= 1.35 &&
				features.averageRuleCost < 1.6 &&
				features.subsetRatio >= 0.175 &&
				features.enumerationRatio === 0 &&
				features.maxRuleCost <= 3 &&
				features.scarceStepRatio >= 0.4
			);
		case "expert":
			return (
				features.enumerationRatio >= 0.04 &&
				features.averageRuleCost >= 1.6 &&
				features.maxEnumerationConstraintSize >= 9
			);
	}
}

export function solutionMatchesDifficulty(
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

export function difficultyDistance(
	result: SolverResult,
	difficulty: DifficultyKey,
	mineCount: number,
	requestedMineCount: number,
) {
	if (result.contradiction) return 10_000;
	const features = result.features;
	const score = calculateAverageDifficultyScore(result.steps);
	const unsolvedPenalty = result.solved
		? 0
		: 1_000 + Math.round((1 - result.progress) * 500);
	const mineCountPenalty = Math.abs(mineCount - requestedMineCount) * 0.25;
	let profilePenalty = 0;
	switch (difficulty) {
		case "beginner":
			profilePenalty =
				Math.max(0, 1.08 - features.averageRuleCost) * 300 +
				Math.max(0, features.averageRuleCost - 1.2) * 300 +
				Math.max(0, 0.04 - features.subsetRatio) * 3_500 +
				Math.max(0, features.subsetRatio - 0.1) * 2_000 +
				features.enumerationRatio * 2_400 +
				Math.max(0, features.maxRuleCost - 3) * 80 +
				Math.abs(features.subsetRatio - 0.06) * 100 +
				Math.abs(score - 112.5) * 0.1;
			break;
		case "intermediate":
			profilePenalty =
				Math.max(0, 1.2 - features.averageRuleCost) * 300 +
				Math.max(0, features.averageRuleCost - 1.35) * 300 +
				Math.max(0, 0.1 - features.subsetRatio) * 3_500 +
				Math.max(0, features.subsetRatio - 0.175) * 2_000 +
				features.enumerationRatio * 2_400 +
				Math.max(0, features.maxRuleCost - 3) * 80 +
				Math.abs(features.subsetRatio - 0.13) * 100 +
				Math.abs(score - 125) * 0.1;
			break;
		case "advanced":
			profilePenalty =
				Math.max(0, 1.35 - features.averageRuleCost) * 300 +
				Math.max(0, features.averageRuleCost - 1.6) * 300 +
				Math.max(0, 0.175 - features.subsetRatio) * 3_500 +
				features.enumerationRatio * 2_400 +
				Math.max(0, features.maxRuleCost - 3) * 100 +
				Math.max(0, 0.4 - features.scarceStepRatio) * 180 +
				Math.abs(features.hardStepRatio - 0.22) * 100 +
				Math.abs(score - 145) * 0.1;
			break;
		case "expert":
			profilePenalty =
				Math.max(0, 0.04 - features.enumerationRatio) * 9_000 +
				Math.max(0, 1.6 - features.averageRuleCost) * 300 +
				Math.max(0, 9 - features.maxEnumerationConstraintSize) * 45 +
				Math.abs(features.enumerationRatio - 0.06) * 100 +
				Math.abs(score - 175) * 0.1;
			break;
	}
	return unsolvedPenalty + profilePenalty + mineCountPenalty;
}
