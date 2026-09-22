"use client";

import { useState } from "react";
import {
	createProfileStory,
	type ProfileNoteId,
	profileNotes,
} from "../data/profileStory";
import ProfileAccents from "./ProfileAccents";
import ProfileDetail from "./ProfileDetail";
import ProfileParagraph from "./ProfileParagraph";
import styles from "./ProfileStory.module.css";

export default function ProfileStory({ age }: { age: number }) {
	const chapters = createProfileStory(age);
	const [expanded, setExpanded] = useState<ProfileNoteId[]>([]);
	const [hovered, setHovered] = useState<ProfileNoteId | null>(null);
	const [focused, setFocused] = useState<ProfileNoteId | null>(null);

	function toggle(id: ProfileNoteId) {
		setExpanded((current) =>
			current.includes(id)
				? current.filter((item) => item !== id)
				: [...current, id],
		);
	}

	return (
		<section id="profile-about" className={styles.story} aria-label="自己紹介">
			<ProfileAccents />
			<div className={styles.layout}>
				<div className={styles.prose}>
					{chapters.map((chapter) => (
						<div key={chapter.id} className={styles.chapter}>
							{chapter.paragraphs.map((parts) => (
								<ProfileParagraph key={JSON.stringify(parts)}>
									{parts.map((part) =>
										typeof part === "string" ? (
											part
										) : (
											<button
												key={part.note}
												type="button"
												className={styles.word}
												aria-expanded={expanded.includes(part.note)}
												aria-controls={`profile-detail-${part.note}`}
												onClick={() => toggle(part.note)}
												onPointerEnter={(event) => {
													if (event.pointerType === "mouse")
														setHovered(part.note);
												}}
												onPointerLeave={() => setHovered(null)}
												onFocus={(event) =>
													setFocused(
														event.currentTarget.matches(":focus-visible")
															? part.note
															: null,
													)
												}
												onBlur={() => setFocused(null)}
											>
												{part.text}
											</button>
										),
									)}
									{parts.map((part) => {
										if (typeof part === "string") return null;
										return (
											<ProfileDetail
												key={part.note}
												id={part.note}
												expanded={expanded.includes(part.note)}
												highlighted={
													hovered === part.note || focused === part.note
												}
											/>
										);
									})}
								</ProfileParagraph>
							))}
						</div>
					))}
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
			</div>
		</section>
	);
}
