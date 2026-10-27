"use client";

import type { ReactNode } from "react";
import { useModal } from "@/shared/components/modal/ModalProvider";
import styles from "./HomeAnnouncements.module.css";

export default function AnnouncementArchive({
	children,
}: {
	children: ReactNode;
}) {
	const { openModal } = useModal();

	return (
		<div className={styles.archive}>
			<button
				type="button"
				className={styles.archiveButton}
				aria-haspopup="dialog"
				onClick={() =>
					openModal(
						<section className={styles.archiveDialog}>
							<h2 className={styles.archiveTitle}>全てのお知らせ</h2>
							{children}
						</section>,
						{ ariaLabel: "全てのお知らせ", paddingSize: 0 },
					)
				}
			>
				<span className={styles.archiveLabel}>全てのお知らせ</span>
			</button>
		</div>
	);
}
