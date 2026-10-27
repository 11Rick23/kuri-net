import { describe, expect, test } from "bun:test";
import {
	calculateAverageDifficultyScore,
	difficultyDistance,
	difficultyFeaturesMatchDefinition,
	solutionMatchesDifficulty,
} from "@/features/tools/minesweeper/difficulty";
import {
	type Deduction,
	type DifficultyFeatures,
	type DifficultyKey,
	emptyDifficultyFeatures,
	type SolverResult,
} from "@/features/tools/minesweeper/model";

const matchingFeatures: Record<DifficultyKey, DifficultyFeatures> = {
	beginner: {
		...emptyDifficultyFeatures,
		averageRuleCost: 1.08,
		subsetRatio: 0.04,
		maxRuleCost: 3,
	},
	intermediate: {
		...emptyDifficultyFeatures,
		averageRuleCost: 1.2,
		subsetRatio: 0.1,
		maxRuleCost: 3,
	},
	advanced: {
		...emptyDifficultyFeatures,
		averageRuleCost: 1.35,
		subsetRatio: 0.175,
		maxRuleCost: 3,
		scarceStepRatio: 0.4,
	},
	expert: {
		...emptyDifficultyFeatures,
		averageRuleCost: 1.6,
		enumerationRatio: 0.04,
		maxEnumerationConstraintSize: 9,
	},
};

describe("マインスイーパー難易度", () => {
	test("推論回数ではなく1手あたりの平均コストを得点化する", () => {
		// 機能要件：同じ推論構成では、手数が増えても平均難易度を変えない。
		// Given
		const steps: Deduction[] = [
			{
				action: "reveal",
				targets: [1],
				sources: [0],
				rule: "remaining-mines-zero",
				explanation: "",
			},
			{
				action: "reveal",
				targets: [2],
				sources: [0, 3],
				rule: "subset-difference",
				explanation: "",
			},
		];

		// When / Then
		expect(calculateAverageDifficultyScore(steps)).toBe(200);
		expect(calculateAverageDifficultyScore([...steps, ...steps])).toBe(200);
	});

	test("推論手順がない場合は難易度0を返す", () => {
		// 機能要件：推論を必要としない盤面の平均難易度を0として扱う。
		// When / Then
		expect(calculateAverageDifficultyScore([])).toBe(0);
	});

	test.each(
		Object.entries(matchingFeatures) as [DifficultyKey, DifficultyFeatures][],
	)("%sの下限条件を満たす特徴量を受け入れる", (difficulty, features) => {
		// 機能要件：各難易度で定義した特徴量の下限を有効な盤面として扱う。
		// When / Then
		expect(difficultyFeaturesMatchDefinition(features, difficulty)).toBe(true);
	});

	test.each([
		[
			"初級の平均コスト不足",
			"beginner" as const,
			{ ...matchingFeatures.beginner, averageRuleCost: 1.079 },
		],
		[
			"中級の集合差割合不足",
			"intermediate" as const,
			{ ...matchingFeatures.intermediate, subsetRatio: 0.099 },
		],
		[
			"上級の難手不足",
			"advanced" as const,
			{ ...matchingFeatures.advanced, scarceStepRatio: 0.399 },
		],
		[
			"熟練の列挙制約不足",
			"expert" as const,
			{
				...matchingFeatures.expert,
				maxEnumerationConstraintSize: 8,
			},
		],
	] as const)("%sを拒否する", (_label, difficulty, features) => {
		// 機能要件：難易度の必須条件を1つでも下回る盤面を対象難易度に分類しない。
		// When / Then
		expect(difficultyFeaturesMatchDefinition(features, difficulty)).toBe(false);
	});

	test("解決済みかつ矛盾のない解答だけを難易度一致として扱う", () => {
		// 機能要件：特徴量に加え、完答・非矛盾・推論手順ありを生成候補の条件とする。
		// Given
		const step: Deduction = {
			action: "reveal",
			targets: [1],
			sources: [0],
			rule: "subset-difference",
			explanation: "",
		};
		const result: SolverResult = {
			solved: true,
			contradiction: false,
			steps: [step],
			progress: 1,
			features: matchingFeatures.intermediate,
		};

		// When / Then
		expect(solutionMatchesDifficulty(result, "intermediate")).toBe(true);
		expect(
			solutionMatchesDifficulty(
				{ ...result, contradiction: true },
				"intermediate",
			),
		).toBe(false);
	});

	test("矛盾する候補へ最大ペナルティを与える", () => {
		// 機能要件：矛盾を含む盤面を局所探索の候補として選ばない。
		// Given
		const result: SolverResult = {
			solved: false,
			contradiction: true,
			steps: [],
			progress: 0,
			features: { ...emptyDifficultyFeatures },
		};

		// When / Then
		expect(difficultyDistance(result, "beginner", 10, 10)).toBe(10_000);
	});
});
