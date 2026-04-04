"use client";

import Image from "next/image";
import type { WorkEntry } from "@/features/works/types";

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
			className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-ctp-surface1 bg-ctp-base text-left shadow-light transition duration-200 hover:-translate-y-1 hover:border-ctp-blue/45 hover:bg-ctp-mantle dark:shadow-dark"
		>
			<div className="relative aspect-[16/10] overflow-hidden border-b border-ctp-surface1 bg-ctp-crust">
				<Image
					src={work.coverImage}
					alt={work.coverAlt}
					fill
					sizes="(max-width: 768px) 100vw, 50vw"
					className="object-cover transition duration-300 group-hover:scale-[1.03]"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-ctp-crust/70 via-transparent to-transparent" />
			</div>

			<div className="flex flex-1 flex-col gap-5 p-6">
				<div className="space-y-3">
					<h2 className="text-2xl font-bold tracking-tight text-ctp-text">
						{work.title}
					</h2>
					<p className="text-sm leading-7 text-ctp-subtext1">{work.summary}</p>
				</div>

				<div className="space-y-3">
					<div className="flex flex-wrap gap-2">
						{work.stack.map((item) => (
							<span
								key={item}
								className="rounded-full border border-ctp-surface1 bg-ctp-mantle px-3 py-1 text-xs font-semibold tracking-wide text-ctp-subtext0"
							>
								{item}
							</span>
						))}
					</div>
					<div className="flex flex-wrap gap-2">
						{work.appealTags.map((tag) => (
							<span
								key={tag}
								className="rounded-full bg-ctp-blue/12 px-3 py-1 text-xs font-semibold text-ctp-blue"
							>
								{tag}
							</span>
						))}
					</div>
				</div>

				<div className="mt-auto pt-2 text-sm font-semibold text-ctp-blue transition group-hover:translate-x-1">
					記事を読む →
				</div>
			</div>
		</button>
	);
}
