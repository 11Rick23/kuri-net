"use client";

import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import ToolsPageFrame from "@/features/tools/components/ToolsPageFrame";
import {
	createForcedMineBoard,
	createRandomSeed,
	type Deduction,
	difficultyDefinitions,
	generateLogicalBoard,
	getLogicalHint,
	getOpeningCells,
	isBoardWon,
	type LogicalBoard,
} from "@/features/tools/minesweeper/logic";
import MinesweeperBoard, {
	type GameStatus,
} from "@/features/tools/minesweeper/MinesweeperBoard";
import MinesweeperHintPopup from "@/features/tools/minesweeper/MinesweeperHintPopup";
import MinesweeperSettings, {
	type BoardSettings,
} from "@/features/tools/minesweeper/MinesweeperSettings";
import MinesweeperToolbar, {
	type InteractionMode,
} from "@/features/tools/minesweeper/MinesweeperToolbar";
import { getToolDefinitionBySlug } from "@/features/tools/toolDefinitions";

const initialBoardSettings: BoardSettings = {
	...difficultyDefinitions.intermediate,
	difficulty: "intermediate",
};

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
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationError, setGenerationError] = useState<string | null>(null);
	const cellRefs = useRef(new Map<number, HTMLButtonElement>());
	const mineStatRef = useRef<HTMLDivElement>(null);
	const boardRef = useRef<HTMLTableElement>(null);
	const hintButtonRef = useRef<HTMLButtonElement>(null);
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
			setIsHintExplanationVisible(true);
			return;
		}
		setHint(getLogicalHint(board, revealed, flags));
		setIsHintExplanationVisible(false);
	}, [board, flags, hint, revealed, status]);
	const closeHint = useCallback(() => {
		setIsHintExplanationVisible(false);
	}, []);

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
					<MinesweeperToolbar
						board={board}
						flagCount={flags.size}
						elapsedSeconds={elapsedSeconds}
						hint={hint}
						status={status}
						interactionMode={interactionMode}
						isHintExplanationVisible={isHintExplanationVisible}
						mineStatRef={mineStatRef}
						hintButtonRef={hintButtonRef}
						onShowHint={showHint}
						onInteractionModeChange={setInteractionMode}
					/>

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
			{hint && isHintExplanationVisible ? (
				<MinesweeperHintPopup
					hint={hint}
					boardRef={boardRef}
					cellRefs={cellRefs}
					mineStatRef={mineStatRef}
					hintButtonRef={hintButtonRef}
					onClose={closeHint}
				/>
			) : null}
		</ToolsPageFrame>
	);
}
