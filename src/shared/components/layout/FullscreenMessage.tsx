import type { ReactNode } from "react";

type FullscreenMessageProps = {
	backgroundLabel?: string;
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	className?: string;
};

export default function FullscreenMessage({
	backgroundLabel,
	title,
	description,
	actions,
	className,
}: FullscreenMessageProps) {
	return (
		<section
			className={[
				"page-shell relative flex w-full flex-col items-center justify-center gap-8 text-center",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{backgroundLabel && (
				<div
					aria-hidden
					className="pointer-events-none select-none text-5xl font-medium leading-none text-ctp-subtext1"
				>
					{backgroundLabel}
				</div>
			)}

			<div className="relative z-10 flex max-w-4xl flex-col items-center gap-5">
				<h1 className="page-heading text-balance">{title}</h1>
				{description && (
					<div className="max-w-2xl text-base leading-8 text-ctp-subtext1 text-pretty">
						{description}
					</div>
				)}
				{actions && (
					<div className="mt-2 flex flex-wrap items-center justify-center gap-3">
						{actions}
					</div>
				)}
			</div>
		</section>
	);
}
