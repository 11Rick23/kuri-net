import Image from "next/image";
import type { WorkEntry } from "@/features/works/types";
import { resolveAssetUrl } from "@/shared/utils/resolveAssetUrl";
import styles from "../works.module.css";

export default function WorkCoverVisual({
	work,
	variant,
}: {
	work: WorkEntry;
	variant: "card" | "detail";
}) {
	if (!work.coverImageAssetKey) {
		const titleSize = Math.min(16, 200 / Array.from(work.title).length);

		return (
			<div className={styles.typographyCover} aria-hidden="true">
				<span
					className={styles.coverTitle}
					style={{ fontSize: `min(5rem, ${titleSize}cqi)` }}
				>
					{work.title}
				</span>
			</div>
		);
	}

	return (
		<Image
			src={resolveAssetUrl(work.coverImageAssetKey)}
			alt={work.coverAlt ?? work.title}
			fill
			sizes={
				variant === "detail"
					? "(max-width: 768px) 92vw, 56rem"
					: "(max-width: 767px) 100vw, 40vw"
			}
			className={styles.coverImage}
		/>
	);
}
