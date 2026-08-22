"use client";

import {
	type PointerEvent as ReactPointerEvent,
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import {
	getHintPopupPosition,
	type HintPopupPosition,
} from "@/features/tools/minesweeper/hintPosition";
import type { Deduction } from "@/features/tools/minesweeper/model";
import { ruleLabels } from "@/features/tools/minesweeper/model";

export default function MinesweeperHintPopup({
	hint,
	boardRef,
	cellRefs,
	mineStatRef,
	hintButtonRef,
	onClose,
}: {
	hint: Deduction;
	boardRef: RefObject<HTMLTableElement | null>;
	cellRefs: RefObject<Map<number, HTMLButtonElement>>;
	mineStatRef: RefObject<HTMLDivElement | null>;
	hintButtonRef: RefObject<HTMLButtonElement | null>;
	onClose: () => void;
}) {
	const [position, setPosition] = useState<HintPopupPosition | null>(null);
	const popupRef = useRef<HTMLDivElement>(null);
	const dragRef = useRef<{
		pointerId: number;
		offsetX: number;
		offsetY: number;
	} | null>(null);
	const isManuallyPositioned = useRef(false);
	const closeAndRestoreFocus = useCallback(() => {
		onClose();
		window.requestAnimationFrame(() => hintButtonRef.current?.focus());
	}, [hintButtonRef, onClose]);

	useEffect(() => {
		const updatePosition = () => {
			if (isManuallyPositioned.current) return;
			const anchor =
				hint.sources.length > 0
					? cellRefs.current.get(hint.sources[0])
					: mineStatRef.current;
			const popup = popupRef.current;
			const board = boardRef.current;
			if (!anchor || !popup || !board) return;

			setPosition(
				getHintPopupPosition(
					anchor.getBoundingClientRect(),
					popup.getBoundingClientRect(),
					board.getBoundingClientRect(),
					{ width: window.innerWidth, height: window.innerHeight },
					hint.targets.flatMap((index) => {
						const target = cellRefs.current.get(index);
						return target ? [target.getBoundingClientRect()] : [];
					}),
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
	}, [boardRef, cellRefs, hint, mineStatRef]);

	useEffect(() => {
		const closeOnPointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (
				popupRef.current?.contains(target) ||
				hintButtonRef.current?.contains(target)
			) {
				return;
			}
			onClose();
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeAndRestoreFocus();
		};

		document.addEventListener("pointerdown", closeOnPointerDown);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", closeOnPointerDown);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [closeAndRestoreFocus, hintButtonRef, onClose]);

	const startDrag = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const popup = popupRef.current;
			if (!popup || !position) return;
			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);
			const rect = popup.getBoundingClientRect();
			dragRef.current = {
				pointerId: event.pointerId,
				offsetX: event.clientX - rect.left,
				offsetY: event.clientY - rect.top,
			};
			isManuallyPositioned.current = true;
		},
		[position],
	);

	const movePopup = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
		const drag = dragRef.current;
		const popup = popupRef.current;
		if (!drag || drag.pointerId !== event.pointerId || !popup) return;
		const padding = 12;
		setPosition({
			left: Math.min(
				window.innerWidth - popup.offsetWidth - padding,
				Math.max(padding, event.clientX - drag.offsetX),
			),
			top: Math.min(
				window.innerHeight - popup.offsetHeight - padding,
				Math.max(padding, event.clientY - drag.offsetY),
			),
		});
	}, []);

	const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
		if (dragRef.current?.pointerId !== event.pointerId) return;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		dragRef.current = null;
	}, []);

	return createPortal(
		<section
			ref={popupRef}
			id="minesweeper-hint-explanation"
			aria-label="ヒント"
			style={{
				top: position?.top ?? 0,
				left: position?.left ?? 0,
				visibility: position ? "visible" : "hidden",
			}}
			className="pointer-events-auto fixed z-50 w-[min(16rem,calc(100vw-1.5rem))] rounded-md border border-ctp-yellow/70 bg-ctp-surface0/95 text-left text-xs leading-5 text-ctp-text backdrop-blur-md"
		>
			<div className="flex items-center border-b border-ctp-surface1">
				<div
					title="ドラッグして移動"
					onPointerDown={startDrag}
					onPointerMove={movePopup}
					onPointerUp={endDrag}
					onPointerCancel={endDrag}
					className="min-w-0 flex-1 cursor-move touch-none select-none px-3 py-1.5 font-bold text-ctp-yellow"
				>
					{ruleLabels[hint.rule]}
				</div>
				<button
					type="button"
					onClick={closeAndRestoreFocus}
					aria-label="ヒントを閉じる"
					className="m-1 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded text-ctp-subtext0 transition hover:bg-ctp-surface1 hover:text-ctp-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ctp-blue"
				>
					<MdClose size={17} aria-hidden="true" />
				</button>
			</div>
			<p role="status" aria-live="polite" className="px-3 py-2">
				{hint.explanation}
			</p>
		</section>,
		document.body,
	);
}
