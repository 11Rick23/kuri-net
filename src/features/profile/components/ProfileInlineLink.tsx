import type { ReactNode } from "react";
import { FiArrowRight, FiExternalLink } from "react-icons/fi";
import HighlightLink from "@/shared/components/motion/HighlightLink";
import linkStyles from "./ProfileLink.module.css";
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

	return (
		<HighlightLink
			href={href}
			className={`${styles.inlineLink} ${linkStyles.link}`}
			target={external ? "_blank" : undefined}
			rel={external ? "noopener noreferrer" : undefined}
			aria-label={`${label}（${external ? "外部サイト、新しいタブで開く" : "サイト内のページへ移動"}）`}
			title={
				external ? "外部サイトを新しいタブで開く" : "サイト内のページへ移動"
			}
		>
			{content}
		</HighlightLink>
	);
}
