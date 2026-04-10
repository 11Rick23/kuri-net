import Image from "next/image";
import type { WorkEntry } from "@/features/works/types";
import { resolveAssetUrl } from "@/shared/utils/resolveAssetUrl";

function TitleArtwork({
	title,
	variant,
}: {
	title: string;
	variant: "card" | "detail";
}) {
	const isDetail = variant === "detail";

	return (
		<div className="absolute inset-0 overflow-hidden bg-[linear-gradient(145deg,_rgba(239,241,245,0.98),_rgba(220,224,232,1)_68%),linear-gradient(180deg,_rgba(30,102,245,0.06),_transparent_44%)] dark:bg-[linear-gradient(145deg,_rgba(30,30,46,0.98),_rgba(17,17,27,1)_68%),linear-gradient(180deg,_rgba(137,180,250,0.12),_transparent_44%)]">
			<div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.16),_rgba(76,79,105,0.08))] dark:bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.02),_rgba(17,17,27,0.34))]" />

			<div
				aria-hidden="true"
				className={[
					"absolute right-4 top-4 font-black uppercase leading-none tracking-[-0.08em] text-black/10 dark:text-white/8",
					isDetail
						? "text-[clamp(5.5rem,22vw,13rem)]"
						: "text-[clamp(4.2rem,15vw,7.5rem)]",
				].join(" ")}
			>
				{title}
			</div>
		</div>
	);
}

export default function WorkCoverVisual({
	work,
	variant,
}: {
	work: WorkEntry;
	variant: "card" | "detail";
}) {
	if (work.coverImageAssetKey && work.coverAlt) {
		const coverImageUrl = resolveAssetUrl(work.coverImageAssetKey);

		return (
			<>
				<Image
					src={coverImageUrl}
					alt={work.coverAlt}
					fill
					sizes={
						variant === "detail"
							? "(max-width: 768px) 100vw, 56rem"
							: "(max-width: 1024px) 100vw, 50vw"
					}
					className="object-cover transition duration-500 group-hover:scale-[1.02]"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-ctp-crust/55 via-transparent to-transparent" />
			</>
		);
	}

	return <TitleArtwork title={work.title} variant={variant} />;
}
