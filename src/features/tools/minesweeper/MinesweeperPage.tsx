"use client";

import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	MdAutoAwesome,
	MdFlag,
	MdOutlineLightbulb,
	MdRefresh,
	MdShield,
	MdTimer,
} from "react-icons/md";
import ToolsPageFrame from "@/features/tools/components/ToolsPageFrame";
import {
	createRandomSeed,
	type Deduction,
	type DifficultyKey,
	difficultyDefinitions,
	difficultyKeys,
	formatCellLabel,
	formatElapsedTime,
	generateLogicalBoard,
	getLogicalHint,
	getOpeningCells,
	isBoardWon,
	type LogicalBoard,
	ruleLabels,
} from "@/features/tools/minesweeper/logic";
import { getToolDefinitionBySlug } from "@/features/tools/toolDefinitions";

type SelectedDifficulty = DifficultyKey | "custom";
type GameStatus = "empty" | "idle" | "playing" | "won" | "lost";
type InteractionMode = "reveal" | "flag";

type CustomSettings = {
	width: number;
	height: number;
	mineCount: number;
	difficulty: DifficultyKey;
	seed: string;
};

const initialCustomSettings: CustomSettings = {
	width: 12,
	height: 12,
	mineCount: 24,
	difficulty: "intermediate",
	seed: "",
};

const numberToneClasses = [
	"",
	"text-ctp-blue",
	"text-ctp-green",
	"text-ctp-red",
	"text-ctp-mauve",
	"text-ctp-peach",
	"text-ctp-teal",
	"text-ctp-maroon",
	"text-ctp-lavender",
];

function Stat({
	label,
	value,
	icon,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
}) {
	return (
		<div className="flex min-w-28 items-center gap-3 rounded-lg border border-ctp-surface1 bg-ctp-mantle px-3 py-2">
			<div className="text-ctp-subtext0">{icon}</div>
			<div>
				<p className="text-[11px] font-semibold uppercase tracking-wider text-ctp-subtext0">
					{label}
				</p>
				<p className="font-mono text-base font-bold text-ctp-text">{value}</p>
			</div>
		</div>
	);
}

function CustomSettingsPanel({
	settings,
	onChange,
	disabled,
}: {
	settings: CustomSettings;
	onChange: (settings: CustomSettings) => void;
	disabled: boolean;
}) {
	const updateNumber = (
		key: "width" | "height" | "mineCount",
		value: string,
	) => {
		onChange({ ...settings, [key]: Number(value) });
	};

	return (
		<div className="grid gap-4 rounded-lg border border-ctp-surface1 bg-ctp-mantle p-4">
			<div>
				<p className="text-xs font-semibold uppercase tracking-wider text-ctp-subtext0">
					カスタム盤面設定
				</p>
				<fieldset className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
					<legend className="sr-only">カスタム盤面の論理難度</legend>
					{difficultyKeys.map((key) => {
						const active = settings.difficulty === key;
						return (
							<button
								key={key}
								type="button"
								aria-pressed={active}
								disabled={disabled}
								onClick={() => onChange({ ...settings, difficulty: key })}
								className={[
									"rounded-md border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
									active
										? "border-ctp-blue bg-ctp-blue/15 text-ctp-blue"
										: "border-ctp-surface1 bg-ctp-base text-ctp-subtext1 hover:border-ctp-overlay0 hover:text-ctp-text",
								].join(" ")}
							>
								{difficultyDefinitions[key].label}
							</button>
						);
					})}
				</fieldset>
			</div>

			<div className="grid gap-3 sm:grid-cols-3">
				{(
					[
						["width", "幅", 5, 20],
						["height", "高さ", 5, 20],
						[
							"mineCount",
							"地雷",
							1,
							Math.max(1, settings.width * settings.height - 9),
						],
					] as const
				).map(([key, label, min, max]) => (
					<label key={key} className="grid gap-1.5 text-sm text-ctp-subtext1">
						<span className="font-semibold">{label}</span>
						<input
							type="number"
							min={min}
							max={max}
							value={settings[key]}
							disabled={disabled}
							onChange={(event) => updateNumber(key, event.target.value)}
							className="h-10 rounded-md border border-ctp-surface1 bg-ctp-base px-3 text-ctp-text transition focus:border-ctp-blue disabled:opacity-50"
						/>
					</label>
				))}
			</div>

			<label className="grid gap-1.5 text-sm text-ctp-subtext1">
				<span className="font-semibold">シード</span>
				<input
					type="text"
					value={settings.seed}
					disabled={disabled}
					autoComplete="off"
					spellCheck={false}
					placeholder="空欄の場合は自動生成"
					onChange={(event) =>
						onChange({ ...settings, seed: event.target.value })
					}
					className="h-10 rounded-md border border-ctp-surface1 bg-ctp-base px-3 font-mono text-sm text-ctp-text transition placeholder:text-ctp-overlay0 focus:border-ctp-blue disabled:opacity-50"
				/>
			</label>
		</div>
	);
}

function HintPanel({
	hint,
	notice,
	onClose,
}: {
	hint: Deduction | null;
	notice: string | null;
	onClose: () => void;
}) {
	if (!hint && !notice) return null;
	const actionLabel =
		hint?.action === "reveal"
			? "安全"
			: hint?.action === "flag"
				? "地雷"
				: "旗を外す";

	return (
		<aside
			aria-label="論理ヒント"
			aria-live="polite"
			className="rounded-lg border border-ctp-blue/40 bg-ctp-blue/10 p-4"
		>
			<div className="flex items-start gap-3">
				<MdOutlineLightbulb
					size={22}
					aria-hidden="true"
					className="mt-0.5 shrink-0 text-ctp-blue"
				/>
				<div className="min-w-0 flex-1 space-y-2">
					{hint ? (
						<>
							<div className="flex flex-wrap items-center gap-2">
								<span className="rounded-full bg-ctp-blue/15 px-2.5 py-1 text-xs font-bold text-ctp-blue">
									{actionLabel}
								</span>
								<code className="rounded-md border border-ctp-surface1 bg-ctp-base px-2 py-1 text-xs text-ctp-subtext1">
									{ruleLabels[hint.rule]}
								</code>
							</div>
							<p className="text-sm leading-6 text-ctp-text">
								{hint.explanation}
							</p>
							<p className="text-xs text-ctp-subtext1">
								確定できるマス {hint.targets.length} / 根拠となる数字マス{" "}
								{hint.sources.length}
							</p>
						</>
					) : (
						<p className="text-sm leading-6 text-ctp-text">{notice}</p>
					)}
				</div>
				<button
					type="button"
					aria-label="ヒントを閉じる"
					onClick={onClose}
					className="rounded-md border border-transparent px-2 py-1 text-ctp-subtext1 transition hover:border-ctp-surface1 hover:bg-ctp-base hover:text-ctp-text"
				>
					×
				</button>
			</div>
		</aside>
	);
}

export default function MinesweeperPage() {
	const tool = getToolDefinitionBySlug("minesweeper");
	const [selectedDifficulty, setSelectedDifficulty] =
		useState<SelectedDifficulty>("beginner");
	const [customSettings, setCustomSettings] = useState(initialCustomSettings);
	const [board, setBoard] = useState<LogicalBoard | null>(null);
	const [status, setStatus] = useState<GameStatus>("empty");
	const [revealed, setRevealed] = useState<Set<number>>(new Set());
	const [flags, setFlags] = useState<Set<number>>(new Set());
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [focusedIndex, setFocusedIndex] = useState(0);
	const [interactionMode, setInteractionMode] =
		useState<InteractionMode>("reveal");
	const [hint, setHint] = useState<Deduction | null>(null);
	const [hintNotice, setHintNotice] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationError, setGenerationError] = useState<string | null>(null);
	const cellRefs = useRef(new Map<number, HTMLButtonElement>());

	useEffect(() => {
		if (status !== "playing") return;
		const timer = window.setInterval(() => {
			setElapsedSeconds((seconds) => seconds + 1);
		}, 1000);
		return () => window.clearInterval(timer);
	}, [status]);

	const resetGame = useCallback((nextBoard: LogicalBoard) => {
		setBoard(nextBoard);
		setStatus("idle");
		setRevealed(new Set());
		setFlags(new Set());
		setElapsedSeconds(0);
		setFocusedIndex(nextBoard.firstIndex);
		setInteractionMode("reveal");
		setHint(null);
		setHintNotice(null);
		window.requestAnimationFrame(() => {
			cellRefs.current.get(nextBoard.firstIndex)?.focus();
		});
	}, []);

	const generateBoard = useCallback(() => {
		setIsGenerating(true);
		setGenerationError(null);
		setHint(null);
		setHintNotice(null);
		window.setTimeout(() => {
			try {
				const preset =
					selectedDifficulty === "custom"
						? customSettings
						: {
								...difficultyDefinitions[selectedDifficulty],
								difficulty: selectedDifficulty,
								seed: "",
							};
				const nextBoard = generateLogicalBoard({
					width: preset.width,
					height: preset.height,
					mineCount: preset.mineCount,
					difficulty: preset.difficulty,
					seed: preset.seed || createRandomSeed(),
				});
				resetGame(nextBoard);
			} catch (error) {
				setGenerationError(
					error instanceof Error
						? error.message
						: "盤面の生成中にエラーが発生しました。",
				);
			} finally {
				setIsGenerating(false);
			}
		}, 20);
	}, [customSettings, resetGame, selectedDifficulty]);

	const restartGame = useCallback(() => {
		if (board) resetGame(board);
	}, [board, resetGame]);

	const closeHint = useCallback(() => {
		setHint(null);
		setHintNotice(null);
	}, []);

	const toggleFlag = useCallback(
		(index: number) => {
			if (!board || status !== "playing" || revealed.has(index)) return;
			setFlags((current) => {
				const next = new Set(current);
				if (next.has(index)) next.delete(index);
				else if (next.size < board.mineCount) next.add(index);
				return next;
			});
			closeHint();
		},
		[board, closeHint, revealed, status],
	);

	const revealCell = useCallback(
		(index: number) => {
			if (
				!board ||
				status === "empty" ||
				status === "won" ||
				status === "lost" ||
				flags.has(index) ||
				(status === "idle" && index !== board.firstIndex)
			) {
				return;
			}
			setFocusedIndex(index);
			closeHint();
			const cell = board.cells[index];
			if (cell.mine) {
				setRevealed((current) => new Set(current).add(index));
				setStatus("lost");
				return;
			}
			const nextRevealed = new Set(revealed);
			for (const opened of getOpeningCells(board, index, flags)) {
				nextRevealed.add(opened);
			}
			setRevealed(nextRevealed);
			setStatus(isBoardWon(board, nextRevealed) ? "won" : "playing");
		},
		[board, closeHint, flags, revealed, status],
	);

	const primaryAction = useCallback(
		(index: number) => {
			if (interactionMode === "flag" && status === "playing") {
				toggleFlag(index);
			} else {
				revealCell(index);
			}
		},
		[interactionMode, revealCell, status, toggleFlag],
	);

	const moveFocus = useCallback(
		(index: number, deltaX: number, deltaY: number) => {
			if (!board) return;
			const x = index % board.width;
			const y = Math.floor(index / board.width);
			const nextX = Math.min(board.width - 1, Math.max(0, x + deltaX));
			const nextY = Math.min(board.height - 1, Math.max(0, y + deltaY));
			const nextIndex = nextY * board.width + nextX;
			setFocusedIndex(nextIndex);
			cellRefs.current.get(nextIndex)?.focus();
		},
		[board],
	);

	const handleCellKeyDown = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>, index: number) => {
			switch (event.key) {
				case "ArrowUp":
					event.preventDefault();
					moveFocus(index, 0, -1);
					break;
				case "ArrowDown":
					event.preventDefault();
					moveFocus(index, 0, 1);
					break;
				case "ArrowLeft":
					event.preventDefault();
					moveFocus(index, -1, 0);
					break;
				case "ArrowRight":
					event.preventDefault();
					moveFocus(index, 1, 0);
					break;
				case "f":
				case "F":
					event.preventDefault();
					toggleFlag(index);
					break;
			}
		},
		[moveFocus, toggleFlag],
	);

	const showHint = useCallback(() => {
		if (!board || status !== "playing") return;
		const nextHint = getLogicalHint(board, revealed, flags);
		setHint(nextHint);
		setHintNotice(
			nextHint
				? null
				: "現在の公開情報からは新しい一手を確定できません。旗の位置を見直してください。",
		);
	}, [board, flags, revealed, status]);

	const hintTargets = useMemo(() => new Set(hint?.targets ?? []), [hint]);
	const hintSources = useMemo(() => new Set(hint?.sources ?? []), [hint]);

	if (!tool) {
		throw new Error("Tool definition not found: minesweeper");
	}

	const statusLabel = {
		empty: "未生成",
		idle: "開始前",
		playing: "プレイ中",
		won: "クリア",
		lost: "ゲームオーバー",
	}[status];
	const cellSize = board
		? board.width >= 16
			? 32
			: board.width >= 12
				? 36
				: 40
		: 40;
	return (
		<ToolsPageFrame
			title={tool.title}
			description={tool.description}
			badges={tool.badges}
		>
			<section
				aria-label="難易度と盤面設定"
				className="space-y-4 rounded-lg border border-ctp-surface1 bg-ctp-base p-4 sm:p-5"
			>
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<fieldset className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
						<legend className="sr-only">難易度</legend>
						{difficultyKeys.map((key) => {
							const definition = difficultyDefinitions[key];
							const active = selectedDifficulty === key;
							return (
								<button
									key={key}
									type="button"
									aria-pressed={active}
									aria-label={`${definition.label}、${definition.width}×${definition.height}、地雷${definition.mineCount}`}
									disabled={isGenerating}
									onClick={() => setSelectedDifficulty(key)}
									className={[
										"rounded-md border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
										active
											? "border-ctp-blue bg-ctp-blue/15 text-ctp-blue"
											: "border-ctp-surface1 bg-ctp-mantle text-ctp-subtext1 hover:border-ctp-overlay0 hover:text-ctp-text",
									].join(" ")}
								>
									<span className="block">{definition.label}</span>
									<span className="mt-0.5 block text-[11px] font-normal opacity-75">
										{definition.width}×{definition.height} /{" "}
										{definition.mineCount}
									</span>
								</button>
							);
						})}
						<button
							type="button"
							aria-pressed={selectedDifficulty === "custom"}
							aria-label="カスタム盤面"
							disabled={isGenerating}
							onClick={() => setSelectedDifficulty("custom")}
							className={[
								"rounded-md border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:col-auto",
								selectedDifficulty === "custom"
									? "border-ctp-blue bg-ctp-blue/15 text-ctp-blue"
									: "border-ctp-surface1 bg-ctp-mantle text-ctp-subtext1 hover:border-ctp-overlay0 hover:text-ctp-text",
							].join(" ")}
						>
							カスタム
						</button>
					</fieldset>
					<button
						type="button"
						disabled={isGenerating}
						onClick={generateBoard}
						className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-ctp-blue px-5 font-bold text-ctp-base transition hover:bg-ctp-sapphire disabled:cursor-wait disabled:opacity-60"
					>
						<MdAutoAwesome size={19} aria-hidden="true" />
						{isGenerating ? "論理検証中…" : "盤面を生成"}
					</button>
				</div>

				{selectedDifficulty === "custom" && (
					<CustomSettingsPanel
						settings={customSettings}
						onChange={setCustomSettings}
						disabled={isGenerating}
					/>
				)}

				{generationError && (
					<p
						role="alert"
						className="rounded-md border border-ctp-red/40 bg-ctp-red/10 px-3 py-2 text-sm text-ctp-red"
					>
						{generationError}
					</p>
				)}
			</section>

			{board ? (
				<>
					<section
						aria-label="ゲーム操作"
						className="flex flex-col gap-4 rounded-lg border border-ctp-surface1 bg-ctp-base p-4 lg:flex-row lg:items-center lg:justify-between"
					>
						<div className="flex flex-wrap gap-2">
							<Stat
								label="地雷残数"
								value={String(board.mineCount - flags.size)}
								icon={<MdFlag size={20} aria-hidden="true" />}
							/>
							<Stat
								label="経過時間"
								value={formatElapsedTime(elapsedSeconds)}
								icon={<MdTimer size={20} aria-hidden="true" />}
							/>
							<div
								role="status"
								className={[
									"inline-flex min-h-12 items-center rounded-lg border px-4 text-sm font-bold",
									status === "won"
										? "border-ctp-green/40 bg-ctp-green/10 text-ctp-green"
										: status === "lost"
											? "border-ctp-red/40 bg-ctp-red/10 text-ctp-red"
											: "border-ctp-surface1 bg-ctp-mantle text-ctp-text",
								].join(" ")}
							>
								{statusLabel}
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								disabled={status !== "playing"}
								onClick={showHint}
								className="inline-flex h-10 items-center gap-2 rounded-md border border-ctp-blue/40 bg-ctp-blue/10 px-3 text-sm font-semibold text-ctp-blue transition hover:bg-ctp-blue/15 disabled:cursor-not-allowed disabled:opacity-45"
							>
								<MdOutlineLightbulb size={19} aria-hidden="true" />
								ヒント
							</button>
							<button
								type="button"
								onClick={restartGame}
								className="inline-flex h-10 items-center gap-2 rounded-md border border-ctp-surface1 bg-ctp-mantle px-3 text-sm font-semibold text-ctp-text transition hover:border-ctp-overlay0 hover:bg-ctp-surface0"
							>
								<MdRefresh size={19} aria-hidden="true" />
								リスタート
							</button>
							<button
								type="button"
								onClick={generateBoard}
								disabled={isGenerating}
								className="inline-flex h-10 items-center gap-2 rounded-md border border-ctp-surface1 bg-ctp-mantle px-3 text-sm font-semibold text-ctp-text transition hover:border-ctp-overlay0 hover:bg-ctp-surface0 disabled:opacity-50"
							>
								<MdAutoAwesome size={18} aria-hidden="true" />
								新しい盤面
							</button>
						</div>
					</section>

					<HintPanel hint={hint} notice={hintNotice} onClose={closeHint} />

					<div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
						<section className="min-w-0 rounded-lg border border-ctp-surface1 bg-ctp-base p-3 sm:p-5">
							<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex flex-wrap items-center gap-2 text-sm">
									<span className="rounded-full bg-ctp-green/15 px-2.5 py-1 font-bold text-ctp-green">
										推測なし
									</span>
									<span className="rounded-full bg-ctp-surface0 px-2.5 py-1 font-mono text-ctp-subtext1">
										{board.width} × {board.height}
									</span>
								</div>
								<fieldset className="inline-flex self-start rounded-md border border-ctp-surface1 bg-ctp-mantle p-1">
									<legend className="sr-only">マスの操作方法</legend>
									{(
										[
											["reveal", "開く"],
											["flag", "旗"],
										] as const
									).map(([mode, label]) => (
										<button
											key={mode}
											type="button"
											aria-pressed={interactionMode === mode}
											disabled={status === "idle" && mode === "flag"}
											onClick={() => setInteractionMode(mode)}
											className={[
												"rounded-md px-3 py-1.5 text-xs font-bold transition disabled:opacity-40",
												interactionMode === mode
													? "bg-ctp-blue text-ctp-base"
													: "text-ctp-subtext1 hover:text-ctp-text",
											].join(" ")}
										>
											{label}
										</button>
									))}
								</fieldset>
							</div>

							<p className="mb-4 text-sm leading-6 text-ctp-subtext1">
								{status === "idle"
									? "青枠の初手を開くとゲームが始まります。"
									: "クリックで開く、右クリックで旗。矢印キーで移動し、Fキーでも旗を切り替えられます。"}
							</p>

							<div className="overflow-x-auto pb-2">
								<table
									aria-label="マインスイーパー盤面"
									className="mx-auto w-max border-separate border-spacing-1 rounded-lg border border-ctp-surface1 bg-ctp-mantle p-1"
								>
									<tbody>
										{board.cells
											.filter((cell) => cell.index % board.width === 0)
											.map((rowStart) => {
												const row = Math.floor(rowStart.index / board.width);
												return (
													<tr key={`row-${rowStart.index}`}>
														{Array.from(
															{ length: board.width },
															(_, column) => {
																const index = row * board.width + column;
																const cell = board.cells[index];
																const isRevealed = revealed.has(index);
																const isFlagged = flags.has(index);
																const showMine =
																	(status === "lost" || status === "won") &&
																	cell.mine;
																const isExploded =
																	status === "lost" && isRevealed && cell.mine;
																const isDisabled =
																	status === "won" ||
																	status === "lost" ||
																	(status === "idle" &&
																		index !== board.firstIndex);
																return (
																	<td key={index} className="p-0">
																		<button
																			key={index}
																			ref={(element) => {
																				if (element)
																					cellRefs.current.set(index, element);
																				else cellRefs.current.delete(index);
																			}}
																			type="button"
																			aria-label={formatCellLabel(
																				board,
																				index,
																				{
																					revealed: isRevealed,
																					flagged: isFlagged,
																					showMine,
																					first:
																						status === "idle" &&
																						index === board.firstIndex,
																					hintTarget: hintTargets.has(index),
																					hintSource: hintSources.has(index),
																				},
																			)}
																			aria-disabled={isDisabled}
																			tabIndex={focusedIndex === index ? 0 : -1}
																			style={{
																				width: cellSize,
																				height: cellSize,
																			}}
																			onFocus={() => setFocusedIndex(index)}
																			onClick={() => primaryAction(index)}
																			onContextMenu={(event) => {
																				event.preventDefault();
																				toggleFlag(index);
																			}}
																			onKeyDown={(event) =>
																				handleCellKeyDown(event, index)
																			}
																			className={[
																				"relative flex aspect-square touch-manipulation select-none items-center justify-center rounded-md border text-sm font-extrabold leading-none transition",
																				isExploded
																					? "border-ctp-red bg-ctp-red/20 text-ctp-red"
																					: showMine
																						? "border-ctp-red/40 bg-ctp-red/10 text-ctp-red"
																						: isFlagged
																							? "border-ctp-blue/60 bg-ctp-blue/15 text-ctp-blue hover:bg-ctp-blue/20"
																							: isRevealed
																								? `border-ctp-surface1 bg-ctp-base ${numberToneClasses[cell.adjacentMines]}`
																								: "border-ctp-overlay0/60 bg-ctp-surface0 text-ctp-text hover:border-ctp-blue/60 hover:bg-ctp-surface1",
																				hintTargets.has(index)
																					? "z-10 ring-2 ring-ctp-blue ring-offset-1 ring-offset-ctp-mantle"
																					: "",
																				hintSources.has(index)
																					? "z-10 border-ctp-sapphire ring-1 ring-ctp-sapphire/70"
																					: "",
																				status === "idle" &&
																				index === board.firstIndex
																					? "z-10 ring-2 ring-ctp-blue ring-offset-2 ring-offset-ctp-mantle"
																					: "",
																				isDisabled
																					? "cursor-not-allowed opacity-55"
																					: "cursor-pointer",
																			].join(" ")}
																		>
																			{isFlagged ? (
																				<MdFlag size={18} aria-hidden="true" />
																			) : showMine ? (
																				<span aria-hidden="true">✹</span>
																			) : isRevealed &&
																				cell.adjacentMines > 0 ? (
																				<span aria-hidden="true">
																					{cell.adjacentMines}
																				</span>
																			) : null}
																		</button>
																	</td>
																);
															},
														)}
													</tr>
												);
											})}
									</tbody>
								</table>
							</div>
						</section>

						<aside className="space-y-4 rounded-lg border border-ctp-surface1 bg-ctp-base p-4">
							<div className="flex items-center gap-2 text-ctp-green">
								<MdShield size={22} aria-hidden="true" />
								<p className="font-bold">論理検証済み</p>
							</div>
							<p className="text-sm leading-6 text-ctp-subtext1">
								初手から最後まで、公開済みの数字だけで安全マスと地雷を確定できます。
							</p>
							<dl className="grid grid-cols-2 gap-2 text-sm">
								<div className="rounded-md bg-ctp-mantle p-3">
									<dt className="text-xs text-ctp-subtext0">論理難度</dt>
									<dd className="mt-1 font-mono font-bold text-ctp-text">
										{board.difficultyScore}
									</dd>
								</div>
								<div className="rounded-md bg-ctp-mantle p-3">
									<dt className="text-xs text-ctp-subtext0">推論</dt>
									<dd className="mt-1 font-mono font-bold text-ctp-text">
										{board.solutionSteps.length}
									</dd>
								</div>
							</dl>
							<div className="space-y-1 border-t border-ctp-surface1 pt-3 text-xs text-ctp-subtext0">
								<p>
									最大ルール:{" "}
									<span className="text-ctp-subtext1">
										{ruleLabels[board.maxRule]}
									</span>
								</p>
								<p className="break-all font-mono">{board.seed}</p>
							</div>
						</aside>
					</div>
				</>
			) : (
				<section className="grid min-h-64 place-items-center rounded-lg border border-dashed border-ctp-surface1 bg-ctp-base p-8 text-center">
					<div className="max-w-md space-y-3">
						<MdShield
							size={36}
							aria-hidden="true"
							className="mx-auto text-ctp-blue"
						/>
						<h2 className="text-lg font-bold text-ctp-text">
							論理だけで解ける盤面を生成します
						</h2>
						<p className="text-sm leading-6 text-ctp-subtext1">
							難易度を選び「盤面を生成」を押してください。生成した盤面はサーバーへ送信されません。
						</p>
					</div>
				</section>
			)}
		</ToolsPageFrame>
	);
}
