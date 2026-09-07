"use client";

import Link from "next/link";
import type { WorkEntry, WorkSectionMedia } from "@/features/works/types";
import VideoPlayer from "@/shared/components/media/VideoPlayer";
import { resolveAssetUrl } from "@/shared/utils/resolveAssetUrl";
import styles from "../works.module.css";
import WorkCoverVisual from "./WorkCoverVisual";

function MetaItem({ label, value }: { label: string; value: string }) {
	return (
		<div className={styles.detailMetaItem}>
			<p className={styles.metaLabel}>{label}</p>
			<p className={styles.metaValue}>{value}</p>
		</div>
	);
}

function SectionMedia({ media }: { media: WorkSectionMedia }) {
	if (media.type === "video") {
		return (
			<div className={styles.media}>
				<VideoPlayer
					src={resolveAssetUrl(media.assetKey)}
					poster={
						media.posterAssetKey
							? resolveAssetUrl(media.posterAssetKey)
							: undefined
					}
					title={media.title}
				/>
				{media.caption ? (
					<p className={styles.mediaCaption}>{media.caption}</p>
				) : null}
			</div>
		);
	}

	return (
		<div className={styles.media}>
			<div className={styles.mediaAction}>
				<Link
					href={resolveAssetUrl(media.assetKey)}
					target="_blank"
					rel="noopener noreferrer"
					className={styles.detailLink}
				>
					{media.title}
				</Link>
			</div>
			{media.caption ? (
				<p className={styles.mediaCaption}>{media.caption}</p>
			) : null}
		</div>
	);
}

export default function WorkDetailModal({ work }: { work: WorkEntry }) {
	const metaItems = [
		work.period ? { label: "期間", value: work.period } : null,
		work.role ? { label: "担当", value: work.role } : null,
		work.teamSize ? { label: "体制", value: work.teamSize } : null,
	].filter((item): item is { label: string; value: string } => item !== null);

	return (
		<article className={styles.detail}>
			<header className={styles.detailHeader}>
				<h2 className={styles.detailTitle}>{work.title}</h2>
				<p className={styles.detailSummary}>{work.summary}</p>
			</header>
			{work.coverImageAssetKey && work.coverAlt && (
				<div className={styles.detailCover}>
					<WorkCoverVisual work={work} variant="detail" />
				</div>
			)}

			<div className={styles.detailBody}>
				{metaItems.length > 0 && (
					<div className={styles.detailMeta}>
						{metaItems.map((item) => (
							<MetaItem
								key={item.label}
								label={item.label}
								value={item.value}
							/>
						))}
					</div>
				)}

				<p className={styles.detailLead}>{work.lead}</p>

				<div className={styles.stack}>
					{work.stack.map((item) => (
						<span key={item}>{item}</span>
					))}
				</div>

				<div className={styles.detailSections}>
					{work.sections.map((section) => (
						<section key={section.id} className={styles.detailSection}>
							<h3 className={styles.detailSectionHeading}>{section.heading}</h3>
							{section.media
								?.filter((media) => media.placement === "before")
								.map((media) => (
									<SectionMedia
										key={`${section.heading}-${media.type}-${media.assetKey}-before`}
										media={media}
									/>
								))}
							<div className={styles.paragraphs}>
								{section.paragraphs.map((paragraph) => (
									<p key={`${section.id}-${paragraph}`}>{paragraph}</p>
								))}
							</div>
							{section.media
								?.filter((media) => media.placement === "after")
								.map((media) => (
									<SectionMedia
										key={`${section.heading}-${media.type}-${media.assetKey}-after`}
										media={media}
									/>
								))}
						</section>
					))}
				</div>

				{work.links && work.links.length > 0 && (
					<section className={styles.detailLinks}>
						<h3 className={styles.detailSectionHeading}>リンク</h3>
						<div className={styles.linksList}>
							{work.links.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className={styles.detailLink}
								>
									{link.label}
								</Link>
							))}
						</div>
					</section>
				)}
			</div>
		</article>
	);
}
