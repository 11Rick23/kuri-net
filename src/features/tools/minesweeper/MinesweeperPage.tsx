"use client";

import {
	type KeyboardEvent,
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { MdFlag, MdOutlineLightbulb, MdTimer } from "react-icons/md";
import ToolsPageFrame from "@/features/tools/components/ToolsPageFrame";
import {
	getHintPopupPosition,
	type HintPopupPosition,
} from "@/features/tools/minesweeper/hintPosition";
import {
	createForcedMineBoard,
	createRandomSeed,
	type Deduction,
	difficultyDefinitions,
	formatElapsedTime,
	generateLogicalBoard,
	getLogicalHint,
	getOpeningCells,
	isBoardWon,
	type LogicalBoard,
	ruleLabels,
} from "@/features/tools/minesweeper/logic";
import MinesweeperBoard, {
	type GameStatus,
} from "@/features/tools/minesweeper/MinesweeperBoard";
import MinesweeperSettings, {
	type BoardSettings,
} from "@/features/tools/minesweeper/MinesweeperSettings";
import { getToolDefinitionBySlug } from "@/features/tools/toolDefinitions";

type InteractionMode = "reveal" | "flag";

const initialBoardSettings: BoardSettings = {
	...difficultyDefinitions.intermediate,
	difficulty: "intermediate",
};

function Stat({
	label,
	value,
	icon,
	highlighted = false,
	elementRef,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	highlighted?: boolean;
	elementRef?: React.Ref<HTMLDivElement>;
}) {
	return (
		<div
			ref={elementRef}
			className={[
				"inline-flex h-9 items-center gap-2 rounded-md border px-2 text-sm text-ctp-subtext1 transition",
				highlighted
					? "border-ctp-yellow bg-ctp-yellow/10 ring-1 ring-ctp-yellow"
					: "border-transparent",
			].join(" ")}
		>
			<span className="text-ctp-subtext0">{icon}</span>
			<span className="sr-only">{label}</span>
			<span className="font-mono font-bold text-ctp-text">{value}</span>
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
	const [hint, setHint] = useState<Deduction | null>(null);
	const [isHintExplanationVisible, setIsHintExplanationVisible] =
		useState(false);
	const [hintPopupPosition, setHintPopupPosition] =
		useState<HintPopupPosition | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationError, setGenerationError] = useState<string | null>(null);
	const cellRefs = useRef(new Map<number, HTMLButtonElement>());
	const mineStatRef = useRef<HTMLDivElement>(null);
	const boardRef = useRef<HTMLTableElement>(null);
	const hintPopupRef = useRef<HTMLDivElement>(null);
	const hintButtonRef = useRef<HTMLButtonElement>(null);
	const hintDragRef = useRef<{
		pointerId: number;
		offsetX: number;
		offsetY: number;
	} | null>(null);
	const isHintPopupManuallyPositioned = useRef(false);
	const hasGeneratedInitialBoard = useRef(false);

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
		setIsHintExplanationVisible(false);
		setHintPopupPosition(null);
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
			setHint(null);
			setIsHintExplanationVisible(false);
			setHintPopupPosition(null);
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
				revealed.has(index) ||
				flags.has(index) ||
				(status === "idle" && index !== board.firstIndex)
			) {
				return;
			}
			setHint(null);
			setIsHintExplanationVisible(false);
			setHintPopupPosition(null);
			setFocusedIndex(index);
			const forcedMineBoard =
				status === "playing"
					? createForcedMineBoard(board, revealed, index)
					: null;
			if (forcedMineBoard) {
				setBoard(forcedMineBoard);
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

	const showHint = useCallback(() => {
		if (!board || status !== "playing") return;
		if (hint) {
			isHintPopupManuallyPositioned.current = false;
			setIsHintExplanationVisible(true);
			return;
		}
		setHint(getLogicalHint(board, revealed, flags));
		setIsHintExplanationVisible(false);
		setHintPopupPosition(null);
	}, [board, flags, hint, revealed, status]);

	useEffect(() => {
		if (!hint || !isHintExplanationVisible) return;

		const updatePosition = () => {
			if (isHintPopupManuallyPositioned.current) return;
			const anchor =
				hint.sources.length > 0
					? cellRefs.current.get(hint.sources[0])
					: mineStatRef.current;
			const popup = hintPopupRef.current;
			const boardElement = boardRef.current;
			if (!anchor || !popup || !boardElement) return;
			const anchorRect = anchor.getBoundingClientRect();
			const popupRect = popup.getBoundingClientRect();
			const boardRect = boardElement.getBoundingClientRect();
			const targetRects = hint.targets.flatMap((index) => {
				const target = cellRefs.current.get(index);
				return target ? [target.getBoundingClientRect()] : [];
			});
			setHintPopupPosition(
				getHintPopupPosition(
					anchorRect,
					popupRect,
					boardRect,
					{
						width: window.innerWidth,
						height: window.innerHeight,
					},
					targetRects,
				),
			);
		};

		updatePosition();
		window.addEventListener("resize", updatePosition);
		document.addEventListener("scroll", updatePosition, true);
		return () => {
			window.removeEventListener("resize", updatePosition);
			document.removeEventListener("scroll", updatePosition, true);
		};
	}, [hint, isHintExplanationVisible]);

	useEffect(() => {
		if (!isHintExplanationVisible) return;
		const closeOnOutsidePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (
				hintPopupRef.current?.contains(target) ||
				hintButtonRef.current?.contains(target)
			) {
				return;
			}
			setIsHintExplanationVisible(false);
			setHintPopupPosition(null);
		};
		document.addEventListener("pointerdown", closeOnOutsidePointerDown);
		return () =>
			document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
	}, [isHintExplanationVisible]);

	const startHintDrag = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const popup = hintPopupRef.current;
			if (!popup || !hintPopupPosition) return;
			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);
			const rect = popup.getBoundingClientRect();
			hintDragRef.current = {
				pointerId: event.pointerId,
				offsetX: event.clientX - rect.left,
				offsetY: event.clientY - rect.top,
			};
			isHintPopupManuallyPositioned.current = true;
		},
		[hintPopupPosition],
	);

	const moveHintPopup = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const drag = hintDragRef.current;
			const popup = hintPopupRef.current;
			if (!drag || drag.pointerId !== event.pointerId || !popup) return;
			const padding = 12;
			setHintPopupPosition({
				left: Math.min(
					window.innerWidth - popup.offsetWidth - padding,
					Math.max(padding, event.clientX - drag.offsetX),
				),
				top: Math.min(
					window.innerHeight - popup.offsetHeight - padding,
					Math.max(padding, event.clientY - drag.offsetY),
				),
			});
		},
		[],
	);

	const endHintDrag = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (hintDragRef.current?.pointerId !== event.pointerId) return;
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
			hintDragRef.current = null;
		},
		[],
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
	const hintSources = new Set(hint?.sources ?? []);
	return (
		<ToolsPageFrame title={tool.title}>
			<MinesweeperSettings
				settings={boardSettings}
				onChange={setBoardSettings}
				onGenerate={generateBoard}
				isGenerating={isGenerating}
				generationError={generationError}
			/>

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
								highlighted={hint?.rule === "global-mine-count"}
								elementRef={mineStatRef}
							/>
							<Stat
								label="経過時間"
								value={formatElapsedTime(elapsedSeconds)}
								icon={<MdTimer size={20} aria-hidden="true" />}
							/>
						</div>

						<div className="inline-flex h-9 items-center gap-2 px-2 font-mono text-xs text-ctp-subtext0 sm:justify-self-center">
							<span>
								{board.width} × {board.height}
							</span>
							<span aria-hidden="true" className="text-ctp-surface2">
								/
							</span>
							<span>
								難易度{" "}
								<strong className="font-bold text-ctp-text">
									{board.difficultyScore}
								</strong>
							</span>
						</div>

						<div className="flex items-center gap-3 sm:justify-self-end">
							<button
								ref={hintButtonRef}
								type="button"
								disabled={status !== "playing"}
								onClick={showHint}
								aria-expanded={isHintExplanationVisible}
								aria-controls="minesweeper-hint-explanation"
								className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-ctp-surface1 bg-ctp-mantle px-2.5 text-sm font-semibold text-ctp-text transition hover:border-ctp-yellow hover:text-ctp-yellow disabled:cursor-not-allowed disabled:opacity-40"
							>
								<MdOutlineLightbulb size={18} aria-hidden="true" />
								<span>ヒント</span>
							</button>
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
								className="inline-flex h-9 cursor-pointer items-center gap-2 text-sm font-semibold text-ctp-text transition disabled:cursor-not-allowed disabled:opacity-40"
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
					</div>

					<MinesweeperBoard
						board={board}
						status={status}
						revealed={revealed}
						flags={flags}
						hintSources={hintSources}
						isHintExplanationVisible={isHintExplanationVisible}
						focusedIndex={focusedIndex}
						cellSize={cellSize}
						boardRef={boardRef}
						cellRefs={cellRefs}
						onFocus={setFocusedIndex}
						onPrimaryAction={primaryAction}
						onToggleFlag={toggleFlag}
						onKeyDown={handleCellKeyDown}
					/>
				</section>
			) : null}
			{hint &&
				isHintExplanationVisible &&
				createPortal(
					<div
						ref={hintPopupRef}
						id="minesweeper-hint-explanation"
						role="status"
						aria-live="polite"
						style={{
							top: hintPopupPosition?.top ?? 0,
							left: hintPopupPosition?.left ?? 0,
							visibility: hintPopupPosition ? "visible" : "hidden",
						}}
						className="pointer-events-auto fixed z-50 w-[min(16rem,calc(100vw-1.5rem))] rounded-md border border-ctp-yellow/70 bg-ctp-surface0/95 text-left text-xs leading-5 text-ctp-text backdrop-blur-md"
					>
						<div
							title="ドラッグして移動"
							onPointerDown={startHintDrag}
							onPointerMove={moveHintPopup}
							onPointerUp={endHintDrag}
							onPointerCancel={endHintDrag}
							className="touch-none select-none border-b border-ctp-surface1 px-3 py-1.5 font-bold text-ctp-yellow cursor-move"
						>
							{ruleLabels[hint.rule]}
						</div>
						<p className="px-3 py-2">{hint.explanation}</p>
					</div>,
					document.body,
				)}
		</ToolsPageFrame>
	);
}
