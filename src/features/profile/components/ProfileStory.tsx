"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useModal } from "@/shared/components/modal/ModalProvider";
import Reveal from "@/shared/components/motion/Reveal";
import { createProfileStory, type ProfilePassage } from "../data/profileStory";
import { constrainNote, placeNote } from "../lib/profileNotePosition";
import ProfileAccents from "./ProfileAccents";
import ProfileDetail from "./ProfileDetail";
import ProfileInlineLink from "./ProfileInlineLink";
import ProfileNote, { type OpenProfileNote } from "./ProfileNote";
import styles from "./ProfileStory.module.css";

const desktopQuery = "(min-width: 1100px) and (min-height: 520px)";

export default function ProfileStory({ age }: { age: number }) {
	const chapters = createProfileStory(age);
	const layout = useRef<HTMLDivElement>(null);
	const triggers = useRef(new Map<string, HTMLButtonElement>());
	const [notes, setNotes] = useState<OpenProfileNote[]>([]);
	const [desktop, setDesktop] = useState<boolean | null>(null);
	const { openModal, closeModal, isOpen: modalOpen } = useModal();

	const readNote = useCallback(
		(passage: ProfilePassage) => {
			openModal(<ProfileDetail passage={passage} onNavigate={closeModal} />, {
				ariaLabel: passage.title,
				paddingSize: 0,
				returnFocusFallback: () => triggers.current.get(passage.id) ?? null,
			});
		},
		[openModal, closeModal],
	);

	const closeNote = useCallback((id: string) => {
		setNotes((current) => current.filter((note) => note.passage.id !== id));
		triggers.current.get(id)?.focus({ preventScroll: true });
	}, []);

	useEffect(() => {
		const media = window.matchMedia(desktopQuery);
		const resize = () => {
			setDesktop(media.matches);
			const body = layout.current?.getBoundingClientRect();
			if (!body || !media.matches) return;
			const viewport = {
				width: window.innerWidth,
				height: document.documentElement.scrollHeight,
			};
			setNotes((current) =>
				current.reduce<OpenProfileNote[]>((placed, note) => {
					const position = note.moved
						? constrainNote(note, viewport)
						: placeNote({
								left: body.left,
								right: body.right,
								top: note.y,
								viewport,
								occupied: placed,
							});
					placed.push({ ...note, ...position });
					return placed;
				}, []),
			);
		};
		resize();
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, []);

	useEffect(() => {
		if (desktop !== false || notes.length === 0) return;
		const latest = notes.at(-1);
		if (latest) readNote(latest.passage);
		setNotes([]);
	}, [desktop, notes, readNote]);

	useEffect(() => {
		if (modalOpen || notes.length === 0) return;
		const onEscape = (event: KeyboardEvent) => {
			const latest = notes.at(-1);
			if (event.key === "Escape" && latest) {
				event.preventDefault();
				closeNote(latest.passage.id);
			}
		};
		document.addEventListener("keydown", onEscape);
		return () => document.removeEventListener("keydown", onEscape);
	}, [notes, modalOpen, closeNote]);

	const showNote = (passage: ProfilePassage, trigger: HTMLButtonElement) => {
		if (!window.matchMedia(desktopQuery).matches) {
			readNote(passage);
			return;
		}
		if (notes.some((note) => note.passage.id === passage.id)) {
			closeNote(passage.id);
			return;
		}
		const body = layout.current?.getBoundingClientRect();
		if (!body) return;
		const position = placeNote({
			left: body.left,
			right: body.right,
			top: trigger.getBoundingClientRect().top + window.scrollY,
			viewport: {
				width: window.innerWidth,
				height: window.innerHeight,
				scrollY: window.scrollY,
			},
			occupied: notes,
		});
		setNotes((current) => [...current, { passage, ...position, moved: false }]);
	};

	return (
		<section id="profile-about" className={styles.story} aria-label="自己紹介">
			<ProfileAccents />
			<div ref={layout} className={styles.layout}>
				<div className={`${styles.prose} ${styles.interactive}`}>
					{chapters.map((chapter) => (
						<Reveal key={chapter.id} className={styles.chapter}>
							{chapter.paragraphs.map((passages) => (
								<p
									className={styles.paragraph}
									key={passages.map((passage) => passage.id).join("-")}
								>
									{passages.map((passage) => (
										<span key={passage.id}>
											{passage.summary.map((part) =>
												typeof part === "string" ? (
													part
												) : "href" in part ? (
													<ProfileInlineLink
														key={part.href}
														href={part.href}
														label={part.text}
													>
														{part.text}
													</ProfileInlineLink>
												) : (
													<button
														key={passage.id}
														ref={(element) => {
															if (element)
																triggers.current.set(passage.id, element);
															else triggers.current.delete(passage.id);
														}}
														type="button"
														className={styles.word}
														aria-expanded={notes.some(
															(note) => note.passage.id === passage.id,
														)}
														aria-controls={
															notes.some(
																(note) => note.passage.id === passage.id,
															)
																? `profile-note-${passage.id}`
																: undefined
														}
														aria-haspopup={
															desktop === false ? "dialog" : undefined
														}
														title={`「${passage.title}」のメモを開く`}
														onClick={(event) =>
															showNote(passage, event.currentTarget)
														}
													>
														{part.text}
													</button>
												),
											)}
										</span>
									))}
								</p>
							))}
						</Reveal>
					))}
				</div>
				<noscript>
					<style>{`.${styles.interactive} { display: none; }`}</style>
					<div className={styles.fallback}>
						{chapters
							.flatMap((chapter) => chapter.paragraphs.flat())
							.map((passage) => (
								<details key={passage.id}>
									<summary>
										{passage.summary
											.map((part) =>
												typeof part === "string" ? part : part.text,
											)
											.join("")}
									</summary>
									<ProfileDetail passage={passage} />
								</details>
							))}
					</div>
				</noscript>
			</div>
			{notes.length > 0 &&
				createPortal(
					[...notes]
						.sort((a, b) => a.passage.id.localeCompare(b.passage.id))
						.map((note) => (
							<ProfileNote
								key={note.passage.id}
								note={note}
								order={notes.findIndex(
									(item) => item.passage.id === note.passage.id,
								)}
								onMove={(position) =>
									setNotes((current) =>
										current.map((item) =>
											item.passage.id === note.passage.id
												? { ...item, ...position, moved: true }
												: item,
										),
									)
								}
								onFront={() =>
									setNotes((current) =>
										current.at(-1)?.passage.id === note.passage.id
											? current
											: [
													...current.filter(
														(item) => item.passage.id !== note.passage.id,
													),
													note,
												],
									)
								}
								onClose={() => closeNote(note.passage.id)}
								onRead={() => readNote(note.passage)}
							/>
						)),
					document.body,
				)}
		</section>
	);
}
