import type { RefObject } from "react";
import { MdFlag, MdOutlineLightbulb, MdTimer } from "react-icons/md";
import { formatElapsedTime } from "@/features/tools/minesweeper/board";
import type { GameStatus } from "@/features/tools/minesweeper/MinesweeperBoard";
import type {
	Deduction,
	LogicalBoard,
} from "@/features/tools/minesweeper/model";

export type InteractionMode = "reveal" | "flag";

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
	elementRef?: RefObject<HTMLDivElement | null>;
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

export default function MinesweeperToolbar({
	board,
	flagCount,
	elapsedSeconds,
	hint,
	status,
	interactionMode,
	isHintExplanationVisible,
	mineStatRef,
	hintButtonRef,
	onShowHint,
	onInteractionModeChange,
}: {
	board: LogicalBoard;
	flagCount: number;
	elapsedSeconds: number;
	hint: Deduction | null;
	status: GameStatus;
	interactionMode: InteractionMode;
	isHintExplanationVisible: boolean;
	mineStatRef: RefObject<HTMLDivElement | null>;
	hintButtonRef: RefObject<HTMLButtonElement | null>;
	onShowHint: () => void;
	onInteractionModeChange: (mode: InteractionMode) => void;
}) {
	return (
		<div className="grid justify-items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
			<div className="flex flex-wrap justify-center gap-2 sm:justify-self-start">
				<Stat
					label="地雷残数"
					value={String(board.mineCount - flagCount)}
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
					onClick={onShowHint}
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
						onInteractionModeChange(
							interactionMode === "reveal" ? "flag" : "reveal",
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
								interactionMode === "flag" ? "translate-x-6" : "translate-x-1",
							].join(" ")}
						/>
					</span>
				</button>
			</div>
		</div>
	);
}
