"use client";

import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { MdAutoAwesome, MdFlag, MdHelpOutline, MdTimer } from "react-icons/md";
import ToolBadge from "@/features/tools/components/ToolBadge";
import ToolsPageFrame from "@/features/tools/components/ToolsPageFrame";
import {
	createRandomSeed,
	type DifficultyKey,
	difficultyDefinitions,
	difficultyKeys,
	formatCellLabel,
	formatElapsedTime,
	generateLogicalBoard,
	getOpeningCells,
	isBoardWon,
	type LogicalBoard,
} from "@/features/tools/minesweeper/logic";
import { getToolDefinitionBySlug } from "@/features/tools/toolDefinitions";

type GameStatus = "empty" | "idle" | "playing" | "won" | "lost";
type InteractionMode = "reveal" | "flag";

type BoardSettings = {
	width: number;
	height: number;
	mineCount: number;
	difficulty: DifficultyKey;
};

const presetKeys = ["beginner", "intermediate", "advanced"] as const;

const initialBoardSettings: BoardSettings = {
	...difficultyDefinitions.intermediate,
	difficulty: "intermediate",
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
		<div className="inline-flex h-9 items-center gap-2 px-2 text-sm text-ctp-subtext1">
			<span className="text-ctp-subtext0">{icon}</span>
			<span className="sr-only">{label}</span>
			<span className="font-mono font-bold text-ctp-text">{value}</span>
		</div>
	);
}

function BoardSettingsPanel({
	settings,
	onChange,
	disabled,
}: {
	settings: BoardSettings;
	onChange: (settings: BoardSettings) => void;
	disabled: boolean;
}) {
	const updateNumber = (
		key: "width" | "height" | "mineCount",
		value: string,
	) => {
		onChange({ ...settings, [key]: Number(value) });
	};

	return (
		<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
			{(
				[
					["width", "幅", 5, 20],
					["height", "高さ", 5, 20],
					[
						"mineCount",
						"地雷数",
						1,
						Math.max(1, settings.width * settings.height - 9),
					],
				] as const
			).map(([key, label, min, max]) => (
				<label key={key} className="grid gap-1 text-xs text-ctp-subtext1">
					<span>{label}</span>
					<input
						type="number"
						min={min}
						max={max}
						value={settings[key]}
						disabled={disabled}
						onChange={(event) => updateNumber(key, event.target.value)}
						className="h-9 min-w-0 rounded-md border border-ctp-surface1 bg-ctp-mantle px-2 text-sm text-ctp-text transition focus:border-ctp-blue disabled:opacity-50"
					/>
				</label>
			))}
			<div className="grid gap-1 text-xs text-ctp-subtext1">
				<div className="flex items-center gap-1">
					<span>論理難度</span>
					<ToolBadge
						icon={<MdHelpOutline size={15} aria-hidden="true" />}
						ariaLabel="論理難度の説明を表示"
						triggerClassName="!p-0 text-ctp-subtext0 hover:text-ctp-blue"
						contentToneClassName="!right-auto !left-0 w-64 !translate-x-0 text-left leading-5"
						wrapContent
					>
						盤面を解くために必要な推論の複雑さです。盤面サイズや地雷数とは別で、高いほど集合比較や候補の組み合わせを使う盤面になります。
					</ToolBadge>
				</div>
				<select
					aria-label="論理難度"
					value={settings.difficulty}
					disabled={disabled}
					onChange={(event) =>
						onChange({
							...settings,
							difficulty: event.target.value as DifficultyKey,
						})
					}
					className="h-9 min-w-0 cursor-pointer rounded-md border border-ctp-surface1 bg-ctp-mantle px-2 text-sm text-ctp-text transition focus:border-ctp-blue disabled:cursor-not-allowed disabled:opacity-50"
				>
					{difficultyKeys.map((key) => (
						<option key={key} value={key}>
							{difficultyDefinitions[key].label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

export default function MinesweeperPage() {
	const tool = getToolDefinitionBySlug("minesweeper");
	const [boardSettings, setBoardSettings] = useState(initialBoardSettings);
	const [board, setBoard] = useState<LogicalBoard | null>(null);
	const [status, setStatus] = useState<GameStatus>("empty");
	const [revealed, setRevealed] = useState<Set<number>>(new Set());
	const [flags, setFlags] = useState<Set<number>>(new Set());
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [focusedIndex, setFocusedIndex] = useState(0);
	const [interactionMode, setInteractionMode] =
		useState<InteractionMode>("reveal");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationError, setGenerationError] = useState<string | null>(null);
	const cellRefs = useRef(new Map<number, HTMLButtonElement>());
	const hasGeneratedInitialBoard = useRef(false);
	const selectedPreset = presetKeys.find((key) => {
		const preset = difficultyDefinitions[key];
		return (
			boardSettings.width === preset.width &&
			boardSettings.height === preset.height &&
			boardSettings.mineCount === preset.mineCount &&
			boardSettings.difficulty === key
		);
	});

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
		window.requestAnimationFrame(() => {
			cellRefs.current.get(nextBoard.firstIndex)?.focus();
		});
	}, []);

	const generateBoard = useCallback(() => {
		setIsGenerating(true);
		setGenerationError(null);
		window.setTimeout(() => {
			try {
				const nextBoard = generateLogicalBoard({
					width: boardSettings.width,
					height: boardSettings.height,
					mineCount: boardSettings.mineCount,
					difficulty: boardSettings.difficulty,
					seed: createRandomSeed(),
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
	}, [boardSettings, resetGame]);

	useEffect(() => {
		if (hasGeneratedInitialBoard.current) return;
		hasGeneratedInitialBoard.current = true;
		generateBoard();
	}, [generateBoard]);

	const toggleFlag = useCallback(
		(index: number) => {
			if (!board || status !== "playing" || revealed.has(index)) return;
			setFlags((current) => {
				const next = new Set(current);
				if (next.has(index)) next.delete(index);
				else if (next.size < board.mineCount) next.add(index);
				return next;
			});
		},
		[board, revealed, status],
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
		[board, flags, revealed, status],
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

	if (!tool) {
		throw new Error("Tool definition not found: minesweeper");
	}

	const cellSize = board
		? board.width >= 16
			? 32
			: board.width >= 12
				? 36
				: 40
		: 40;
	return (
		<ToolsPageFrame title={tool.title}>
			<section
				aria-label="難易度と盤面設定"
				className="rounded-lg border border-ctp-surface1 bg-ctp-base p-3"
			>
				<div className="grid justify-items-center gap-5 md:grid-cols-[5rem_minmax(19rem,24rem)_auto] md:items-center md:justify-center">
					<fieldset className="grid w-full max-w-xs grid-cols-3 gap-2 md:w-20 md:grid-cols-1 md:justify-self-center">
						<legend className="sr-only">設定プリセット</legend>
						{presetKeys.map((key) => {
							const definition = difficultyDefinitions[key];
							const active = selectedPreset === key;
							return (
								<button
									key={key}
									type="button"
									aria-pressed={active}
									aria-label={`${definition.label}、${definition.width}×${definition.height}、地雷${definition.mineCount}`}
									disabled={isGenerating}
									onClick={() =>
										setBoardSettings({
											...definition,
											difficulty: key,
										})
									}
									className={[
										"h-9 cursor-pointer rounded-md border px-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
										active
											? "border-ctp-blue bg-ctp-blue/15 text-ctp-blue"
											: "border-ctp-surface1 bg-ctp-mantle text-ctp-subtext1 hover:border-ctp-overlay0 hover:text-ctp-text",
									].join(" ")}
								>
									{definition.label}
								</button>
							);
						})}
					</fieldset>
					<div className="w-full max-w-xs sm:max-w-sm md:flex md:max-w-none md:items-center md:self-stretch md:border-x md:border-ctp-surface1 md:px-6">
						<BoardSettingsPanel
							settings={boardSettings}
							onChange={setBoardSettings}
							disabled={isGenerating}
						/>
					</div>
					<button
						type="button"
						disabled={isGenerating}
						onClick={generateBoard}
						className="inline-flex h-9 w-auto shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-ctp-blue px-4 text-sm font-bold text-ctp-base transition hover:bg-ctp-sapphire disabled:cursor-wait disabled:opacity-60 md:justify-self-center"
					>
						<MdAutoAwesome size={18} aria-hidden="true" />
						{isGenerating ? "論理検証中…" : "盤面を生成"}
					</button>
				</div>

				{generationError && (
					<p
						role="alert"
						className="mt-3 rounded-md border border-ctp-red/40 bg-ctp-red/10 px-3 py-2 text-sm text-ctp-red"
					>
						{generationError}
					</p>
				)}
			</section>

			{board ? (
				<section
					aria-label="マインスイーパー"
					className="min-w-0 rounded-lg border border-ctp-surface1 bg-ctp-base p-3 sm:p-4"
				>
					<div className="grid justify-items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
						<div className="flex flex-wrap justify-center gap-2 sm:justify-self-start">
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
						</div>

						<span className="inline-flex h-9 items-center px-2 font-mono text-xs text-ctp-subtext0 sm:justify-self-center">
							{board.width} × {board.height}
						</span>

						<button
							type="button"
							role="switch"
							aria-checked={interactionMode === "flag"}
							disabled={status !== "playing"}
							onClick={() =>
								setInteractionMode((mode) =>
									mode === "reveal" ? "flag" : "reveal",
								)
							}
							className="inline-flex h-9 cursor-pointer items-center gap-2 text-sm font-semibold text-ctp-text transition disabled:cursor-not-allowed disabled:opacity-40 sm:justify-self-end"
						>
							<span>フラグモード</span>
							<span
								aria-hidden="true"
								className={[
									"relative inline-block h-6 w-11 shrink-0 rounded-full border transition-colors",
									interactionMode === "flag"
										? "border-ctp-blue bg-ctp-blue"
										: "border-ctp-surface1 bg-ctp-surface0",
								].join(" ")}
							>
								<span
									className={[
										"absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-ctp-overlay0 bg-ctp-base transition-transform",
										interactionMode === "flag"
											? "translate-x-6"
											: "translate-x-1",
									].join(" ")}
								/>
							</span>
						</button>
					</div>

					<div className="relative mt-3 overflow-x-auto border-t border-ctp-surface1 pt-3">
						{(status === "won" || status === "lost") && (
							<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
								<div
									role="status"
									aria-live="assertive"
									aria-atomic="true"
									className={[
										"flex h-20 w-56 items-center justify-center whitespace-nowrap rounded-md border bg-ctp-base/60 px-4 text-center text-xl font-extrabold",
										status === "won"
											? "border-ctp-green/70 text-ctp-green"
											: "border-ctp-red/70 text-ctp-red",
									].join(" ")}
								>
									{status === "won" ? "クリア" : "ゲームオーバー"}
								</div>
							</div>
						)}
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
												{Array.from({ length: board.width }, (_, column) => {
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
														(status === "idle" && index !== board.firstIndex);
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
																aria-label={formatCellLabel(board, index, {
																	revealed: isRevealed,
																	flagged: isFlagged,
																	showMine,
																	first:
																		status === "idle" &&
																		index === board.firstIndex,
																})}
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
																) : isRevealed && cell.adjacentMines > 0 ? (
																	<span aria-hidden="true">
																		{cell.adjacentMines}
																	</span>
																) : null}
															</button>
														</td>
													);
												})}
											</tr>
										);
									})}
							</tbody>
						</table>
					</div>
				</section>
			) : null}
		</ToolsPageFrame>
	);
}
