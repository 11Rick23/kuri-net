import {
	type KeyboardEvent,
	type PointerEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { type ProfileNoteId, profileNotes } from "../data/profileStory";
import { constrainNotePosition, type NotePosition } from "../lib/notePosition";
import styles from "./ProfileStory.module.css";

export default function ProfileNote({
	id,
	desktop,
	active,
	onActivate,
	onClose,
}: {
	id: ProfileNoteId;
	desktop: boolean;
	active: boolean;
	onActivate: () => void;
	onClose: () => void;
}) {
	const note = profileNotes[id];
	const paper = useRef<HTMLElement>(null);
	const heading = useRef<HTMLHeadingElement>(null);
	const [position, setPosition] = useState<NotePosition>({ x: 0, y: 0 });
	const positionRef = useRef(position);
	const drag = useRef<{
		pointer: number;
		x: number;
		y: number;
		origin: NotePosition;
	} | null>(null);
	const [dragging, setDragging] = useState(false);
	const [run, setRun] = useState(0);

	useEffect(() => {
		heading.current?.focus({ preventScroll: desktop });
		paper.current?.scrollIntoView({ block: desktop ? "nearest" : "start" });
	}, [desktop]);

	useEffect(() => {
		const reset = () => {
			positionRef.current = { x: 0, y: 0 };
			setPosition(positionRef.current);
			drag.current = null;
			setDragging(false);
		};
		window.addEventListener("resize", reset);
		return () => window.removeEventListener("resize", reset);
	}, []);

	function move(next: NotePosition) {
		const element = paper.current;
		if (!element) return;
		const rect = element.getBoundingClientRect();
		const headerHeight =
			Number.parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue(
					"--site-header-height",
				),
			) || 88;
		const bounded = constrainNotePosition(
			next,
			{
				left: rect.left - positionRef.current.x,
				top: rect.top - positionRef.current.y,
				width: rect.width,
				height: rect.height,
			},
			{
				width: window.innerWidth,
				height: window.innerHeight,
				top: headerHeight + 16,
			},
		);
		positionRef.current = bounded;
		setPosition(bounded);
	}

	function startDrag(event: PointerEvent<HTMLButtonElement>) {
		if (event.button !== 0) return;
		onActivate();
		drag.current = {
			pointer: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			origin: positionRef.current,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
		setDragging(true);
	}

	function dragNote(event: PointerEvent<HTMLButtonElement>) {
		const start = drag.current;
		if (!start || start.pointer !== event.pointerId) return;
		move({
			x: start.origin.x + event.clientX - start.x,
			y: start.origin.y + event.clientY - start.y,
		});
	}

	function endDrag() {
		drag.current = null;
		setDragging(false);
	}

	function moveWithKeys(event: KeyboardEvent<HTMLButtonElement>) {
		const step = event.shiftKey ? 32 : 8;
		const changes: Record<string, NotePosition> = {
			ArrowLeft: { x: -step, y: 0 },
			ArrowRight: { x: step, y: 0 },
			ArrowUp: { x: 0, y: -step },
			ArrowDown: { x: 0, y: step },
		};
		const change = changes[event.key];
		if (!change) return;
		event.preventDefault();
		move({
			x: positionRef.current.x + change.x,
			y: positionRef.current.y + change.y,
		});
	}

	return (
		<section
			ref={paper}
			id={`profile-note-${id}`}
			className={styles.paper}
			aria-labelledby={`profile-note-title-${id}`}
			data-active={active}
			data-dragging={dragging}
			style={
				desktop ? { translate: `${position.x}px ${position.y}px` } : undefined
			}
			onFocus={onActivate}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					event.stopPropagation();
					onClose();
				}
			}}
		>
			<div className={styles.paperHeader}>
				<h2 ref={heading} tabIndex={-1} id={`profile-note-title-${id}`}>
					{note.title}
				</h2>
				{desktop && (
					<button
						type="button"
						className={styles.grip}
						aria-label={`${note.title}のメモを移動`}
						title="ドラッグ、または矢印キーで移動。Enterで元の位置に戻す"
						onPointerDown={startDrag}
						onPointerMove={dragNote}
						onPointerUp={endDrag}
						onPointerCancel={endDrag}
						onLostPointerCapture={endDrag}
						onKeyDown={moveWithKeys}
						onClick={(event) => {
							if (event.detail === 0) {
								positionRef.current = { x: 0, y: 0 };
								setPosition(positionRef.current);
							}
						}}
					>
						<svg viewBox="0 0 16 24" width="16" height="24" aria-hidden="true">
							<g fill="currentColor">
								{[5, 12, 19].map((y) => (
									<g key={y}>
										<circle cx="4" cy={y} r="1.6" />
										<circle cx="12" cy={y} r="1.6" />
									</g>
								))}
							</g>
						</svg>
					</button>
				)}
				<button
					type="button"
					className={styles.close}
					aria-label={`${note.title}のメモを閉じる`}
					onClick={onClose}
				>
					<svg
						viewBox="0 0 24 24"
						width="20"
						height="20"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						aria-hidden="true"
					>
						<path d="m6 6 12 12M18 6 6 18" />
					</svg>
				</button>
			</div>
			<div className={styles.paperBody}>
				{note.paragraphs.map((paragraph) => (
					<p key={paragraph}>{paragraph}</p>
				))}
				{"links" in note && (
					<div className={styles.noteLinks}>
						{note.links.map((link) => (
							<a
								key={link.href}
								href={link.href}
								target={link.href.startsWith("https:") ? "_blank" : undefined}
								rel={
									link.href.startsWith("https:")
										? "noopener noreferrer"
										: undefined
								}
							>
								{link.text}
								<span aria-hidden="true">↗</span>
							</a>
						))}
					</div>
				)}
				{id === "ski" && (
					<div className={styles.ski}>
						<svg viewBox="0 0 300 130" fill="none" aria-hidden="true">
							<path
								d="m8 42 40-29 30 20 23-12 38 22M172 35l39-24 40 30 38-15"
								stroke="var(--site-line)"
							/>
							<path
								d="M145 15C35 42 235 56 157 81S65 102 215 120"
								stroke="var(--site-accent)"
								strokeWidth="2"
							/>
							<g stroke="currentColor">
								<path d="M117 28v18m0-18 16 3-16 4M192 57v18m0-18-16 3 16 4M106 91v18m0-18 16 3-16 4" />
							</g>
							<circle
								key={run}
								className={run ? styles.skier : undefined}
								cx={run ? 0 : 145}
								cy={run ? 0 : 15}
								r="4"
								fill="var(--site-ink)"
							/>
						</svg>
						<button type="button" onClick={() => setRun((value) => value + 1)}>
							コースをたどる <span aria-hidden="true">↘</span>
						</button>
					</div>
				)}
			</div>
			{desktop && (
				<button
					type="button"
					className={styles.reset}
					onClick={() => {
						positionRef.current = { x: 0, y: 0 };
						setPosition(positionRef.current);
					}}
				>
					位置を戻す
				</button>
			)}
		</section>
	);
}
