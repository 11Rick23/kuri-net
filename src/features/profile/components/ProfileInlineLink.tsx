import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowRight, FiExternalLink } from "react-icons/fi";
import styles from "./ProfileStory.module.css";

export default function ProfileInlineLink({
	href,
	label,
	children,
}: {
	href: string;
	label: string;
	children: ReactNode;
}) {
	const external = href.startsWith("https://");
	const content = (
		<>
			{children}
			<span className={styles.linkMarker} aria-hidden="true">
				{external ? <FiExternalLink /> : <FiArrowRight />}
			</span>
		</>
	);

	return external ? (
		<a
			href={href}
			className={styles.inlineLink}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${label}（外部サイト、新しいタブで開く）`}
			title="外部サイトを新しいタブで開く"
		>
			{content}
		</a>
	) : (
		<Link
			href={href}
			className={styles.inlineLink}
			aria-label={`${label}（サイト内のページへ移動）`}
			title="サイト内のページへ移動"
		>
			{content}
		</Link>
	);
}
