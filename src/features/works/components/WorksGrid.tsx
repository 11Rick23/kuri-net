"use client";

import { useModal } from "@/shared/components/modal/modalProvider";
import type { WorkEntry } from "@/features/works/types";
import WorkCard from "./WorkCard";
import WorkDetailModal from "./WorkDetailModal";

export default function WorksGrid({ works }: { works: WorkEntry[] }) {
	const { openModal } = useModal();

	return (
		<div className="grid gap-5 lg:grid-cols-2">
			{works.map((work) => (
				<WorkCard
					key={work.slug}
					work={work}
					onOpen={(entry) =>
						openModal(<WorkDetailModal work={entry} />, { paddingSize: 0 })
					}
				/>
			))}
		</div>
	);
}
