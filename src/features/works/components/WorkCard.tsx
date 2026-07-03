"use client";

import { MdArrowForward } from "react-icons/md";
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
			className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-ctp-surface1 bg-ctp-base text-left transition duration-200 hover:border-ctp-overlay0 hover:bg-ctp-mantle active:scale-[0.99]"
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
					{work.stack.slice(0, 3).map((item) => (
						<span
							key={item}
							className="rounded-full border border-ctp-surface1 bg-ctp-mantle px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-ctp-subtext0"
						>
							{item}
						</span>
					))}
					{work.stack.length > 3 ? (
						<span className="rounded-full border border-ctp-surface1 bg-ctp-mantle px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-ctp-subtext0">
							+{work.stack.length - 3}
						</span>
					) : null}
				</div>

				<div className="mt-auto flex flex-col gap-3 border-t border-ctp-surface1 pt-4 sm:flex-row sm:items-end sm:justify-between">
					<div className="grid w-full grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3 text-xs sm:w-64 sm:shrink-0">
						{work.period ? (
							<div className="col-start-1 min-w-0">
								<p className="font-semibold text-ctp-subtext0">期間</p>
								<p className="mt-1 break-words font-semibold text-ctp-text">
									{work.period}
								</p>
							</div>
						) : null}
						{work.teamSize ? (
							<div className="col-start-2 min-w-0">
								<p className="font-semibold text-ctp-subtext0">体制</p>
								<p className="mt-1 break-words font-semibold text-ctp-text">
									{work.teamSize}
								</p>
							</div>
						) : null}
					</div>
					<span className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface1 bg-ctp-base px-3 py-2 text-sm font-semibold text-ctp-text transition duration-200 group-hover:border-ctp-blue/45 group-hover:text-ctp-blue">
						詳細を見る
						<MdArrowForward
							aria-hidden
							className="h-4 w-4 shrink-0 transition duration-200 group-hover:translate-x-0.5"
						/>
					</span>
				</div>
			</div>
		</button>
	);
}
