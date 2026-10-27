import { useEffect, useRef, useState } from "react";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import type { ProfileTimelineEvent } from "../data/profileData";
import ProfileInlineLink from "./ProfileInlineLink";
import styles from "./ProfileTimeline.module.css";

export default function ProfileTimelineEventCard({
	event,
}: {
	event: ProfileTimelineEvent;
}) {
	const content = useRef<HTMLDivElement>(null);
	const [expanded, setExpanded] = useState(false);
	const [preview, setPreview] = useState({ height: 0, overflows: false });
	const contentId = `profile-event-content-${event.id}`;
	const collapsed = preview.overflows && !expanded;

	useEffect(() => {
		const element = content.current;
		if (!element) return;
		const measure = () => {
			if (element.getClientRects().length === 0) return;
			const height =
				Number.parseFloat(getComputedStyle(element).lineHeight) * 12;
			const overflows = element.scrollHeight > height + 2;
			setPreview((current) =>
				current.height === height && current.overflows === overflows
					? current
					: { height, overflows },
			);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<li className={styles.event}>
			<p className={styles.eventDate}>
				<span>{event.date}</span>
			</p>
			<article
				className={styles.eventCard}
				aria-labelledby={`profile-event-${event.id}`}
			>
				<header>
					<h5 id={`profile-event-${event.id}`}>{event.title}</h5>
				</header>
				<div className={styles.copyLayout}>
					<div
						id={contentId}
						className={styles.eventCopy}
						data-collapsed={collapsed}
						style={{ maxHeight: collapsed ? preview.height : undefined }}
						onFocusCapture={() => {
							if (collapsed) setExpanded(true);
						}}
					>
						<div ref={content} className={styles.eventText}>
							{event.detail.map((paragraph) => (
								<p
									key={paragraph
										.map((part) =>
											typeof part === "string" ? part : part.text,
										)
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
											>
												{part.text}
											</ProfileInlineLink>
										),
									)}
								</p>
							))}
						</div>
					</div>
					{preview.overflows && (
						<button
							type="button"
							className={collapsed ? styles.expandFade : styles.collapseButton}
							aria-label={`「${event.title}」${expanded ? "を折りたたむ" : "の全文を表示"}`}
							aria-expanded={expanded}
							aria-controls={contentId}
							onClick={() => setExpanded((current) => !current)}
						>
							{expanded ? (
								<TbChevronUp aria-hidden="true" />
							) : (
								<TbChevronDown aria-hidden="true" />
							)}
						</button>
					)}
				</div>
			</article>
		</li>
	);
}
