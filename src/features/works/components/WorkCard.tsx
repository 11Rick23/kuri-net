"use client";

import { MdArrowForward } from "react-icons/md";
import type { WorkEntry } from "@/features/works/types";
import styles from "../works.module.css";
import WorkCoverVisual from "./WorkCoverVisual";

export default function WorkCard({
	work,
	onOpen,
}: {
	work: WorkEntry;
	onOpen: (work: WorkEntry) => void;
}) {
	const hasCover = Boolean(work.coverImageAssetKey && work.coverAlt);

	return (
		<button
			type="button"
			onClick={() => onOpen(work)}
			className={[styles.card, !hasCover && styles.withoutCover]
				.filter(Boolean)
				.join(" ")}
		>
			{hasCover && (
				<div className={styles.cardCover}>
					<WorkCoverVisual work={work} variant="card" />
				</div>
			)}

			<div className={styles.cardBody}>
				<div className={styles.cardHeading}>
					<h2 className={styles.cardTitle}>{work.title}</h2>
					<p className={styles.cardSummary}>{work.summary}</p>
				</div>

				<div className={styles.stack}>
					{work.stack.slice(0, 3).map((item) => (
						<span key={item}>{item}</span>
					))}
					{work.stack.length > 3 ? <span>+{work.stack.length - 3}</span> : null}
				</div>

				<div className={styles.cardFooter}>
					<div className={styles.cardMeta}>
						{work.period ? (
							<div>
								<p className={styles.metaLabel}>期間</p>
								<p className={styles.metaValue}>{work.period}</p>
							</div>
						) : null}
						{work.teamSize ? (
							<div>
								<p className={styles.metaLabel}>体制</p>
								<p className={styles.metaValue}>{work.teamSize}</p>
							</div>
						) : null}
					</div>
					<span className={styles.cardAction}>
						詳細を見る
						<MdArrowForward aria-hidden className={styles.actionArrow} />
					</span>
				</div>
			</div>
		</button>
	);
}
