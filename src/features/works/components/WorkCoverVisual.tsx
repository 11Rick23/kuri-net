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
	if (!work.coverImageAssetKey || !work.coverAlt) return null;

	return (
		<Image
			src={resolveAssetUrl(work.coverImageAssetKey)}
			alt={work.coverAlt}
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
