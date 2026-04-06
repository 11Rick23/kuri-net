"use client";

import type { WorkEntry } from "@/features/works/types";
import WorkCoverVisual from "./WorkCoverVisual";

export default function WorkCard({
	work,
	onOpen,
}: {
	work: WorkEntry;
	onOpen: (work: WorkEntry) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => onOpen(work)}
			className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-ctp-surface1 bg-ctp-base text-left shadow-light transition duration-200 hover:-translate-y-0.5 hover:border-ctp-overlay0 hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)] dark:shadow-dark"
		>
			<div className="relative aspect-[16/10] overflow-hidden bg-ctp-crust">
				<WorkCoverVisual work={work} variant="card" />
			</div>

			<div className="flex flex-1 flex-col gap-4 border-t border-ctp-surface1 px-5 py-5 sm:px-6 sm:py-6">
				<div className="space-y-2.5">
					<h2 className="text-2xl font-semibold tracking-tight text-ctp-text">
						{work.title}
					</h2>
					<p className="text-sm leading-7 text-ctp-subtext1">{work.summary}</p>
				</div>

				<div className="flex flex-wrap gap-2 pt-1">
					{work.stack.map((item) => (
						<span
							key={item}
							className="rounded-full border border-ctp-surface1 bg-ctp-mantle px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-ctp-subtext0"
						>
							{item}
						</span>
					))}
				</div>
			</div>
		</button>
	);
}
