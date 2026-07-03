"use client";

import Link from "next/link";
import type { WorkEntry, WorkSectionMedia } from "@/features/works/types";
import VideoPlayer from "@/shared/components/media/VideoPlayer";
import { resolveAssetUrl } from "@/shared/utils/resolveAssetUrl";
import WorkCoverVisual from "./WorkCoverVisual";

function MetaItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-ctp-surface1 bg-ctp-base px-4 py-3">
			<p className="text-[11px] font-semibold text-ctp-subtext0">{label}</p>
			<p className="mt-2 text-sm font-semibold text-ctp-text">{value}</p>
		</div>
	);
}

function SectionMedia({ media }: { media: WorkSectionMedia }) {
	if (media.type === "video") {
		return (
			<div className="space-y-3">
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
					<p className="px-1 text-sm leading-7 text-ctp-subtext1">
						{media.caption}
					</p>
				) : null}
			</div>
		);
	}

	return (
		<div className="space-y-4 py-2">
			<div className="flex justify-center">
				<Link
					href={resolveAssetUrl(media.assetKey)}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex min-h-12 min-w-[16rem] items-center justify-center rounded-lg border border-ctp-blue/35 bg-ctp-blue px-6 py-3 text-center text-sm font-semibold text-ctp-base transition duration-200 hover:bg-ctp-sapphire active:scale-[0.98]"
				>
					{media.title}
				</Link>
			</div>
			{media.caption ? (
				<p className="text-center text-sm leading-7 text-ctp-subtext1">
					{media.caption}
				</p>
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
		<article className="w-[min(92vw,56rem)] max-h-[88vh] overflow-y-auto rounded-lg border border-ctp-overlay0 bg-ctp-surface0">
			<div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-ctp-crust">
				<WorkCoverVisual work={work} variant="detail" />
				<div className="absolute inset-0 bg-gradient-to-t from-ctp-crust via-ctp-crust/45 to-transparent" />
				<div className="absolute inset-x-0 bottom-0 p-6 pr-14 sm:p-8 sm:pr-20">
					<h2 className="text-3xl font-bold tracking-tight text-ctp-text sm:text-4xl">
						{work.title}
					</h2>
					<p className="mt-3 max-w-3xl text-sm leading-7 text-ctp-subtext1 sm:text-base">
						{work.summary}
					</p>
				</div>
			</div>

			<div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
				{metaItems.length > 0 && (
					<div className="grid gap-3 sm:grid-cols-3">
						{metaItems.map((item) => (
							<MetaItem
								key={item.label}
								label={item.label}
								value={item.value}
							/>
						))}
					</div>
				)}

				<div className="rounded-lg border border-ctp-surface1 bg-ctp-base px-5 py-5">
					<p className="text-base leading-8 text-ctp-text sm:text-lg">
						{work.lead}
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					{work.stack.map((item) => (
						<span
							key={item}
							className="rounded-full border border-ctp-surface1 bg-ctp-mantle px-3 py-1.5 text-xs font-semibold tracking-wide text-ctp-subtext0"
						>
							{item}
						</span>
					))}
				</div>

				<div className="space-y-8">
					{work.sections.map((section) => (
						<section key={section.id} className="space-y-3">
							<h3 className="text-2xl font-bold tracking-tight text-ctp-text">
								{section.heading}
							</h3>
							{section.media
								?.filter((media) => media.placement === "before")
								.map((media) => (
									<SectionMedia
										key={`${section.heading}-${media.type}-${media.assetKey}-before`}
										media={media}
									/>
								))}
							<div className="space-y-4 text-sm leading-8 text-ctp-subtext1 sm:text-base">
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
					<section className="space-y-3 border-t border-ctp-surface1 pt-6">
						<h3 className="text-2xl font-bold tracking-tight text-ctp-text">
							リンク
						</h3>
						<div className="flex flex-wrap gap-3">
							{work.links.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex min-h-10 items-center justify-center rounded-lg border border-ctp-surface1 bg-ctp-base px-4 py-2 text-sm font-semibold text-ctp-text transition duration-200 hover:border-ctp-blue/45 hover:bg-ctp-mantle hover:text-ctp-blue active:scale-[0.98]"
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
