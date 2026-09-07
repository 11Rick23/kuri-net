import type { ReactNode } from "react";
import type {
	RichTextContent,
	RichTextLink,
	Topic,
} from "@/features/profile/data/profileContent";
import Reveal from "@/shared/components/motion/Reveal";
import styles from "../Profile.module.css";

export function ProfileSection({
	title,
	description,
	children,
	layout = "split",
}: {
	title: string;
	description?: ReactNode;
	children: ReactNode;
	layout?: "split" | "wide";
}) {
	return (
		<Reveal>
			<section
				className={`${styles.section} ${layout === "wide" ? styles.sectionWide : ""}`}
			>
				<div className={styles.sectionHeader}>
					<h2 className="section-title">{title}</h2>
					{description && (
						<div className={styles.description}>{description}</div>
					)}
				</div>
				<div className={styles.sectionBody}>{children}</div>
			</section>
		</Reveal>
	);
}

export function TextCard({ children }: { children: ReactNode }) {
	return <div className={styles.prose}>{children}</div>;
}

export function RichText({ content }: { content: RichTextContent }) {
	if (typeof content === "string") {
		return content;
	}

	return content.map((part) => {
		if (typeof part === "string") {
			return part;
		}

		return <InlineLink key={`${part.href}-${part.text}`} link={part} />;
	});
}

function InlineLink({ link }: { link: RichTextLink }) {
	const isExternal = /^https?:\/\//.test(link.href);

	return (
		<a
			href={link.href}
			target={isExternal ? "_blank" : undefined}
			rel={isExternal ? "noopener noreferrer" : undefined}
			className={styles.inlineLink}
		>
			{link.text}
		</a>
	);
}

export function TopicGrid({
	topics,
	layout = "grid",
}: {
	topics: Topic[];
	layout?: "grid" | "rows";
}) {
	return (
		<div
			className={`${styles.topics} ${layout === "rows" ? styles.topicRows : ""}`}
		>
			{topics.map((topic) => (
				<article key={topic.title} className={styles.topic}>
					<h3>{topic.title}</h3>
					<p>
						<RichText content={topic.body} />
					</p>
				</article>
			))}
		</div>
	);
}
