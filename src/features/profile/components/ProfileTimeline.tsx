"use client";

import { type KeyboardEvent, useRef, useState } from "react";
import type {
	ProfileTimelineDate,
	ProfileTimelinePeriod,
} from "../data/profileData";
import styles from "./ProfileTimeline.module.css";
import ProfileTimelineEventCard from "./ProfileTimelineEventCard";

function formatDateLabel(date: ProfileTimelineDate | "Current") {
	return date === "Current"
		? date
		: `${date.year}年${date.month === undefined ? "" : `${date.month}月`}`;
}

function PeriodDate({ date }: { date: ProfileTimelineDate | "Current" }) {
	return (
		<span className={styles.rangeDate}>
			{date === "Current" ? (
				<span className={styles.rangeCurrent}>Current</span>
			) : (
				<>
					<span className={styles.rangeYear}>{date.year}</span>
					{date.month !== undefined && (
						<span className={styles.rangeMonth}>
							.{String(date.month).padStart(2, "0")}
						</span>
					)}
				</>
			)}
		</span>
	);
}

export default function ProfileTimeline({
	periods,
}: {
	periods: ProfileTimelinePeriod[];
}) {
	const [selectedId, setSelectedId] = useState(periods.at(-1)?.id);
	const tabs = useRef(new Map<string, HTMLButtonElement>());
	const selected =
		periods.find((period) => period.id === selectedId) ?? periods[0];
	if (!selected) return null;

	const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		let nextIndex: number;
		switch (event.key) {
			case "ArrowRight":
				nextIndex = (index + 1) % periods.length;
				break;
			case "ArrowLeft":
				nextIndex = (index - 1 + periods.length) % periods.length;
				break;
			case "Home":
				nextIndex = 0;
				break;
			case "End":
				nextIndex = periods.length - 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		const next = periods[nextIndex];
		if (!next) return;
		setSelectedId(next.id);
		tabs.current.get(next.id)?.focus({ preventScroll: true });
		tabs.current.get(next.id)?.scrollIntoView({
			block: "nearest",
			inline: "nearest",
			behavior: "instant",
		});
	};

	return (
		<section
			className={styles.timeline}
			aria-labelledby="profile-timeline-heading"
		>
			<h3 id="profile-timeline-heading" className="sr-only">
				経歴
			</h3>
			<div className={styles.timelineScroll}>
				<div
					className={styles.track}
					role="tablist"
					aria-label="経歴の時期"
					aria-orientation="horizontal"
				>
					{periods.map((period, index) => (
						<div className={styles.stop} key={period.id} role="presentation">
							<button
								ref={(element) => {
									if (element) tabs.current.set(period.id, element);
									else tabs.current.delete(period.id);
								}}
								type="button"
								role="tab"
								id={`profile-tab-${period.id}`}
								aria-controls={`profile-panel-${period.id}`}
								aria-selected={period.id === selected.id}
								aria-label={`${period.start.year}年 ${period.age}歳`}
								tabIndex={period.id === selected.id ? 0 : -1}
								className={styles.dateButton}
								onClick={() => setSelectedId(period.id)}
								onKeyDown={(event) => navigate(event, index)}
							>
								<span className={styles.year}>{period.start.year}</span>
								<span className={styles.age}>{period.age}歳</span>
							</button>
						</div>
					))}
				</div>
			</div>
			{periods.map((period) => (
				<div
					key={period.id}
					id={`profile-panel-${period.id}`}
					role="tabpanel"
					aria-labelledby={`profile-tab-${period.id}`}
					hidden={period.id !== selected.id}
					className={styles.panel}
				>
					<header className={styles.periodHeading}>
						<h4
							className={styles.range}
							aria-label={`${formatDateLabel(period.start)}から${formatDateLabel(period.end)}まで`}
						>
							<PeriodDate date={period.start} />
							<span className={styles.rangeSeparator} aria-hidden="true" />
							<PeriodDate date={period.end} />
						</h4>
					</header>
					<ol className={styles.events}>
						{period.events.map((event) => (
							<ProfileTimelineEventCard key={event.id} event={event} />
						))}
					</ol>
				</div>
			))}
		</section>
	);
}
