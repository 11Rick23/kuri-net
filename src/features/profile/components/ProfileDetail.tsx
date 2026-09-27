import type { ProfilePassage } from "../data/profileStory";
import ProfileInlineLink from "./ProfileInlineLink";
import styles from "./ProfileNotes.module.css";

export default function ProfileDetail({
	passage,
	onNavigate,
}: {
	passage: ProfilePassage;
	onNavigate?: () => void;
}) {
	return (
		<article className={styles.fullNote}>
			<h2>{passage.title}</h2>
			<ProfileNoteText passage={passage} onNavigate={onNavigate} />
		</article>
	);
}

export function ProfileNoteText({
	passage,
	onNavigate,
}: {
	passage: ProfilePassage;
	onNavigate?: () => void;
}) {
	return (
		<>
			{passage.detail.map((paragraph) => (
				<p
					key={paragraph
						.map((part) => (typeof part === "string" ? part : part.text))
						.join("")}
				>
					{paragraph.map((part) =>
						typeof part === "string" ? (
							part
						) : (
							<ProfileInlineLink
								key={part.href}
								href={part.href}
								label={part.text}
								onNavigate={onNavigate}
							>
								{part.text}
							</ProfileInlineLink>
						),
					)}
				</p>
			))}
		</>
	);
}
