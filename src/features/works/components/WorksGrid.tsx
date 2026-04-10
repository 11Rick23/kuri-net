"use client";

import type { WorkEntry } from "@/features/works/types";
import { useModal } from "@/shared/components/modal/modalProvider";
import WorkCard from "./WorkCard";
import WorkDetailModal from "./WorkDetailModal";

export default function WorksGrid({ works }: { works: WorkEntry[] }) {
	const { openModal } = useModal();

	return (
		<div className="grid gap-5 lg:grid-cols-2">
			{works.map((work) => (
				<WorkCard
					key={work.title}
					work={work}
					onOpen={(entry) =>
						openModal(<WorkDetailModal work={entry} />, { paddingSize: 0 })
					}
				/>
			))}
		</div>
	);
}
