import type { KeyboardEvent, RefObject } from "react";
import { MdFlag } from "react-icons/md";
import { formatCellLabel } from "@/features/tools/minesweeper/board";
import type { LogicalBoard } from "@/features/tools/minesweeper/model";

export type GameStatus = "empty" | "idle" | "playing" | "won" | "lost";

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

export default function MinesweeperBoard({
	board,
	status,
	revealed,
	flags,
	hintSources,
	isHintExplanationVisible,
	focusedIndex,
	cellSize,
	boardRef,
	cellRefs,
	onFocus,
	onPrimaryAction,
	onToggleFlag,
	onKeyDown,
}: {
	board: LogicalBoard;
	status: GameStatus;
	revealed: Set<number>;
	flags: Set<number>;
	hintSources: Set<number>;
	isHintExplanationVisible: boolean;
	focusedIndex: number;
	cellSize: number;
	boardRef: RefObject<HTMLTableElement | null>;
	cellRefs: RefObject<Map<number, HTMLButtonElement>>;
	onFocus: (index: number) => void;
	onPrimaryAction: (index: number) => void;
	onToggleFlag: (index: number) => void;
	onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
}) {
	return (
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
				ref={boardRef}
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
											(status === "lost" || status === "won") && cell.mine;
										const isExploded =
											status === "lost" && isRevealed && cell.mine;
										const isDisabled =
											status === "won" ||
											status === "lost" ||
											(status === "idle" && index !== board.firstIndex);
										const isHintSource = hintSources.has(index);
										return (
											<td key={index} className="p-0">
												<button
													ref={(element) => {
														if (element) cellRefs.current.set(index, element);
														else cellRefs.current.delete(index);
													}}
													type="button"
													aria-label={formatCellLabel(board, index, {
														revealed: isRevealed,
														flagged: isFlagged,
														showMine,
														first:
															status === "idle" && index === board.firstIndex,
														hintSource: isHintSource,
													})}
													aria-describedby={
														isHintSource && isHintExplanationVisible
															? "minesweeper-hint-explanation"
															: undefined
													}
													aria-disabled={isDisabled}
													tabIndex={focusedIndex === index ? 0 : -1}
													style={{ width: cellSize, height: cellSize }}
													onFocus={() => onFocus(index)}
													onClick={() => onPrimaryAction(index)}
													onContextMenu={(event) => {
														event.preventDefault();
														onToggleFlag(index);
													}}
													onKeyDown={(event) => onKeyDown(event, index)}
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
														status === "idle" && index === board.firstIndex
															? "z-10 ring-2 ring-ctp-blue ring-offset-2 ring-offset-ctp-mantle"
															: "",
														isHintSource
															? "z-10 border-ctp-yellow bg-ctp-yellow/10 ring-2 ring-ctp-yellow ring-offset-1 ring-offset-ctp-mantle"
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
														<span aria-hidden="true">{cell.adjacentMines}</span>
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
	);
}
