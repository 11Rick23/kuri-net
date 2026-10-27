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
	averageRuleCost: number;
	subsetCount: number;
	subsetRatio: number;
	enumerationCount: number;
	enumerationRatio: number;
	hardStepRatio: number;
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

export type SolverResult = {
	solved: boolean;
	contradiction: boolean;
	steps: Deduction[];
	progress: number;
	features: DifficultyFeatures;
};

export const ruleCosts: Record<DeductionRule, number> = {
	"remaining-mines-zero": 1,
	"all-unknown-are-mines": 1,
	"subset-difference": 3,
	"global-mine-count": 5,
	"constraint-enumeration": 8,
};

export const emptyDifficultyFeatures: DifficultyFeatures = {
	maxRuleCost: 0,
	averageRuleCost: 0,
	subsetCount: 0,
	subsetRatio: 0,
	enumerationCount: 0,
	enumerationRatio: 0,
	hardStepRatio: 0,
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

export const deductionExplanations: Record<DeductionRule, string> = {
	"remaining-mines-zero": "周囲の地雷の数を確認してみましょう。",
	"all-unknown-are-mines": "周囲の未確定マス数を確認してみましょう。",
	"subset-difference":
		"強調されたマスの共通部分に含まれる地雷数を確認してみましょう。",
	"global-mine-count": "未発見の地雷の数と未確定マス数を比べてみましょう。",
	"constraint-enumeration":
		"強調されたマスの条件を同時に満たす配置を考えてみましょう。",
};
