"use client";

import type { WorkEntry } from "@/features/works/types";
import { useModal } from "@/shared/components/modal/ModalProvider";
import Reveal from "@/shared/components/motion/Reveal";
import styles from "../works.module.css";
import WorkCard from "./WorkCard";
import WorkDetailModal from "./WorkDetailModal";

export default function WorksGrid({ works }: { works: WorkEntry[] }) {
	const { openModal } = useModal();

	return (
		<div className={styles.worksGrid}>
			{works.map((work) => (
				<Reveal key={work.title}>
					<WorkCard
						work={work}
						onOpen={(entry) =>
							openModal(<WorkDetailModal work={entry} />, {
								ariaLabel: `${entry.title}の詳細`,
								paddingSize: 0,
							})
						}
					/>
				</Reveal>
			))}
		</div>
	);
}
