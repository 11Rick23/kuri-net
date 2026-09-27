"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiMaximize2, FiX } from "react-icons/fi";
import type { ProfilePassage } from "../data/profileStory";
import { constrainNote, type NotePosition } from "../lib/profileNotePosition";
import { ProfileNoteText } from "./ProfileDetail";
import styles from "./ProfileNotes.module.css";

export type OpenProfileNote = NotePosition & {
	passage: ProfilePassage;
	moved: boolean;
};

export default function ProfileNote({
	note,
	order,
	onMove,
	onFront,
	onClose,
	onRead,
}: {
	note: OpenProfileNote;
	order: number;
	onMove: (position: NotePosition) => void;
	onFront: () => void;
	onClose: () => void;
	onRead: () => void;
}) {
	const handle = useRef<HTMLButtonElement>(null);
	const content = useRef<HTMLDivElement>(null);
	const measurement = useRef<HTMLDivElement>(null);
	const readButton = useRef<HTMLButtonElement>(null);
	const [needsFullView, setNeedsFullView] = useState(false);
	useLayoutEffect(() => {
		const area = content.current;
		const text = measurement.current;
		if (!area || !text) return;
		const measure = () => {
			const available =
				area.clientHeight + (readButton.current?.offsetHeight ?? 0);
			setNeedsFullView(text.scrollHeight > available + 1);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(area);
		observer.observe(text);
		return () => observer.disconnect();
	}, []);
	const drag = useRef<{
		pointerId: number;
		x: number;
		y: number;
		origin: NotePosition;
	} | null>(null);
	useEffect(() => {
		handle.current?.focus({ preventScroll: true });
	}, []);
	const move = (position: NotePosition) =>
		onMove(
			constrainNote(position, {
				width: window.innerWidth,
				height: document.documentElement.scrollHeight,
			}),
		);
	return (
		<section
			id={`profile-note-${note.passage.id}`}
			aria-labelledby={`profile-note-title-${note.passage.id}`}
			className={styles.note}
			style={{ left: note.x, top: note.y, zIndex: 40 + order }}
			onFocusCapture={onFront}
		>
			<div className={styles.noteHeader}>
				<button
					ref={handle}
					type="button"
					className={styles.dragHandle}
					aria-label={`「${note.passage.title}」のメモを移動`}
					title="ドラッグまたは矢印キーで移動"
					onPointerDown={(event) => {
						if (event.button !== 0) return;
						onFront();
						drag.current = {
							pointerId: event.pointerId,
							x: event.pageX,
							y: event.pageY,
							origin: { x: note.x, y: note.y },
						};
						event.currentTarget.setPointerCapture(event.pointerId);
					}}
					onPointerMove={(event) => {
						const current = drag.current;
						if (!current || current.pointerId !== event.pointerId) return;
						move({
							x: current.origin.x + event.pageX - current.x,
							y: current.origin.y + event.pageY - current.y,
						});
					}}
					onPointerUp={() => {
						drag.current = null;
					}}
					onPointerCancel={() => {
						drag.current = null;
					}}
					onLostPointerCapture={() => {
						drag.current = null;
					}}
					onKeyDown={(event) => {
						const step = event.shiftKey ? 48 : 16;
						const delta = {
							ArrowLeft: [-step, 0],
							ArrowRight: [step, 0],
							ArrowUp: [0, -step],
							ArrowDown: [0, step],
						}[event.key];
						if (!delta) return;
						event.preventDefault();
						move({ x: note.x + delta[0], y: note.y + delta[1] });
					}}
				>
					<span id={`profile-note-title-${note.passage.id}`}>
						{note.passage.title}
					</span>
				</button>
				<button
					type="button"
					className={styles.iconButton}
					aria-label={`「${note.passage.title}」のメモを閉じる`}
					onClick={onClose}
				>
					<FiX aria-hidden="true" />
				</button>
			</div>
			<div ref={content} className={styles.noteContent}>
				<div
					ref={measurement}
					className={`${styles.compactText} ${styles.measurement}`}
					aria-hidden="true"
					inert
				>
					<ProfileNoteText passage={note.passage} />
				</div>
				{needsFullView ? (
					<p className={styles.preview}>{note.passage.preview}</p>
				) : (
					<div className={styles.compactText}>
						<ProfileNoteText passage={note.passage} />
					</div>
				)}
			</div>
			{needsFullView && (
				<button
					ref={readButton}
					type="button"
					className={styles.readButton}
					onClick={onRead}
				>
					<FiMaximize2 aria-hidden="true" />
					全文を読む
				</button>
			)}
		</section>
	);
}
