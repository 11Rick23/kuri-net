"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
	createProfileStory,
	type ProfileNoteId,
	profileNotes,
	profilePlaces,
} from "../data/profileStory";
import ProfileNote from "./ProfileNote";
import ProfileObject from "./ProfileObject";
import styles from "./ProfileStory.module.css";

const desktopQuery = "(min-width: 1100px) and (min-height: 700px)";

export default function ProfileStory({ age }: { age: number }) {
	const chapters = createProfileStory(age);
	const [openNotes, setOpenNotes] = useState<ProfileNoteId[]>([]);
	const [desktop, setDesktop] = useState(false);
	const triggers = useRef(new Map<ProfileNoteId, HTMLButtonElement>());
	const [activeNote, setActiveNote] = useState<ProfileNoteId | null>(null);

	useEffect(() => {
		const query = window.matchMedia(desktopQuery);
		const update = () => {
			setDesktop(query.matches);
			if (!query.matches) setOpenNotes((current) => current.slice(-1));
		};
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	function closeNote(id: ProfileNoteId) {
		setOpenNotes((current) => current.filter((note) => note !== id));
		setActiveNote(null);
		triggers.current.get(id)?.focus({ preventScroll: desktop });
	}

	function toggleNote(id: ProfileNoteId) {
		if (openNotes.includes(id)) {
			closeNote(id);
			return;
		}
		const useDesktop = window.matchMedia(desktopQuery).matches;
		setDesktop(useDesktop);
		setOpenNotes((current) => (useDesktop ? [...current.slice(-1), id] : [id]));
		setActiveNote(id);
	}

	function renderNote(id: ProfileNoteId) {
		return (
			<ProfileNote
				key={`${desktop}-${id}`}
				id={id}
				desktop={desktop}
				active={activeNote === id}
				onActivate={() => setActiveNote(id)}
				onClose={() => closeNote(id)}
			/>
		);
	}

	function renderTrigger(
		id: ProfileNoteId,
		content: ReactNode,
		className = styles.word,
		label?: string,
	) {
		return (
			<button
				key={id}
				type="button"
				className={className}
				aria-label={label}
				ref={(node) => {
					if (node) triggers.current.set(id, node);
					else triggers.current.delete(id);
				}}
				aria-expanded={openNotes.includes(id)}
				aria-controls={
					openNotes.includes(id) ? `profile-note-${id}` : undefined
				}
				onClick={() => toggleNote(id)}
			>
				{content}
			</button>
		);
	}

	return (
		<section
			id="profile-about"
			className={styles.story}
			data-desktop={desktop}
			aria-label="自己紹介"
		>
			<div className={styles.layout} data-desktop={desktop}>
				<div className={styles.prose}>
					{chapters.map((chapter) => (
						<div
							key={chapter.id}
							className={styles.chapter}
							data-topic={chapter.id}
						>
							<div className={styles.composition}>
								<div className={styles.copy}>
									{chapter.paragraphs.map((parts) => (
										<p key={JSON.stringify(parts)}>
											{parts.map((part) =>
												typeof part === "string"
													? part
													: renderTrigger(part.note, part.text),
											)}
										</p>
									))}
								</div>
								{chapter.object &&
									renderTrigger(
										chapter.object.note,
										<>
											<ProfileObject kind={chapter.object.kind} />
											<span className={styles.objectLabel}>
												{chapter.object.label}
											</span>
											<span className={styles.objectCue} aria-hidden="true">
												{openNotes.includes(chapter.object.note) ? "−" : "＋"}
											</span>
										</>,
										styles.object,
										`${chapter.object.label}の補足`,
									)}
								{chapter.id === "background" && (
									<div className={styles.places}>
										{profilePlaces.map((place) =>
											renderTrigger(
												place.note,
												<>
													<span
														className={styles.countryCode}
														aria-hidden="true"
													>
														{place.code}
													</span>
													<span>{place.name}</span>
												</>,
												styles.stamp,
												`${place.name}での生活`,
											),
										)}
									</div>
								)}
							</div>
							{!desktop &&
								openNotes
									.filter(
										(id) =>
											chapter.object?.note === id ||
											(chapter.id === "background" &&
												profilePlaces.some((place) => place.note === id)) ||
											chapter.paragraphs.some((parts) =>
												parts.some(
													(part) =>
														typeof part !== "string" && part.note === id,
												),
											),
									)
									.map(renderNote)}
						</div>
					))}
				</div>
				{desktop && openNotes.length > 0 && (
					<aside className={styles.rail} aria-label="開いている補足メモ">
						<div className={styles.shelf}>{openNotes.map(renderNote)}</div>
					</aside>
				)}
			</div>
			<noscript>
				<div className={styles.fallback}>
					{Object.entries(profileNotes).map(([id, note]) => (
						<details key={id}>
							<summary>{note.title}</summary>
							{note.paragraphs.map((paragraph) => (
								<p key={paragraph}>{paragraph}</p>
							))}
							{"links" in note &&
								note.links.map((link) => (
									<p key={link.href}>
										<a href={link.href}>{link.text}</a>
									</p>
								))}
						</details>
					))}
				</div>
			</noscript>
		</section>
	);
}
