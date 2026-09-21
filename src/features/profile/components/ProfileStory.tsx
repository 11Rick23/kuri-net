"use client";

import { useState } from "react";
import {
	createProfileStory,
	type ProfileNoteId,
	profileNotes,
} from "../data/profileStory";
import ProfileAccents from "./ProfileAccents";
import styles from "./ProfileStory.module.css";

export default function ProfileStory({ age }: { age: number }) {
	const chapters = createProfileStory(age);
	const [expanded, setExpanded] = useState<ProfileNoteId[]>([]);

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
								<p key={JSON.stringify(parts)}>
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
											>
												{part.text}
											</button>
										),
									)}
									{parts.map((part) => {
										if (typeof part === "string") return null;
										const detail = profileNotes[part.note];
										return (
											<span
												key={part.note}
												id={`profile-detail-${part.note}`}
												className={styles.detail}
												hidden={!expanded.includes(part.note)}
											>
												{" "}
												{detail.paragraphs.join(" ")}
												{"links" in detail &&
													detail.links.map((link) => (
														<span key={link.href}>
															{" "}
															<a href={link.href}>{link.text}</a>
														</span>
													))}
											</span>
										);
									})}
								</p>
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
