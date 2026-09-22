"use client";

import {
	Fragment,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { type ProfileNoteId, profileNotes } from "../data/profileStory";
import { ProfileSpaceContext } from "./ProfileParagraph";
import styles from "./ProfileStory.module.css";

const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });

export default function ProfileDetail({
	id,
	expanded,
	highlighted,
}: {
	id: ProfileNoteId;
	expanded: boolean;
	highlighted: boolean;
}) {
	const runs = useMemo(() => {
		const detail = profileNotes[id];
		const parts: { text: string; href?: string }[] = [
			{ text: ` ${detail.paragraphs.join(" ")}` },
			...("links" in detail
				? detail.links.map((link) => ({
						text: ` ${link.text}`,
						href: link.href,
					}))
				: []),
		];
		let offset = 0;
		return parts.map((part) => {
			const characters = Array.from(
				segmenter.segment(part.text),
				({ segment }) => segment,
			);
			const run = { ...part, characters, offset };
			offset += characters.length;
			return run;
		});
	}, [id]);
	const total = runs.reduce((sum, run) => sum + run.characters.length, 0);
	const [visible, setVisible] = useState(0);
	const [reserved, setReserved] = useState(false);
	const current = useRef(0);
	const waitForSpace = useContext(ProfileSpaceContext);

	useEffect(() => {
		if (expanded && !reserved) {
			setReserved(true);
			return;
		}
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const target = expanded ? total : 0;
		const start = current.current;
		const duration = Math.min(
			expanded ? 1800 : 900,
			Math.max(180, Math.abs(target - start) * (expanded ? 12 : 7)),
		);
		let started = 0;
		let frame = 0;
		let cancelled = false;
		const update = (count: number) => {
			current.current = count;
			setVisible(count);
		};
		const finish = () => {
			cancelAnimationFrame(frame);
			update(target);
			if (!expanded) setReserved(false);
		};
		const animate = (now: number) => {
			const progress = Math.min(1, (now - started) / duration);
			const eased = progress * progress * (3 - 2 * progress);
			update(Math.round(start + (target - start) * eased));
			if (progress < 1) frame = requestAnimationFrame(animate);
			else finish();
		};
		const onPreferenceChange = () => {
			if (reducedMotion.matches) finish();
		};
		const begin = async () => {
			if (expanded && !reducedMotion.matches) await waitForSpace();
			if (cancelled) return;
			if (reducedMotion.matches || start === target) finish();
			else {
				started = performance.now();
				frame = requestAnimationFrame(animate);
			}
		};
		void begin();
		reducedMotion.addEventListener("change", onPreferenceChange);
		return () => {
			cancelled = true;
			cancelAnimationFrame(frame);
			reducedMotion.removeEventListener("change", onPreferenceChange);
		};
	}, [expanded, reserved, total, waitForSpace]);

	return (
		<span
			id={`profile-detail-${id}`}
			className={styles.detail}
			data-highlighted={expanded && highlighted}
			hidden={!reserved}
			aria-hidden={!expanded}
			inert={!expanded}
		>
			{runs.map((run) => {
				const count = Math.max(0, visible - run.offset);
				const text = run.characters.slice(0, count).join("");
				const pending = run.characters.slice(count).join("");
				return (
					<Fragment key={run.offset}>
						{text && (
							<span className={styles.detailVisible}>
								{run.href ? (
									<a href={run.href} aria-label={run.text.trim()}>
										{text}
									</a>
								) : (
									text
								)}
							</span>
						)}
						{pending && (
							<span className={styles.pendingText} aria-hidden="true">
								{pending}
							</span>
						)}
					</Fragment>
				);
			})}
		</span>
	);
}
